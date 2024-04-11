/*!
 * FAIRness scoring function
 *
 * Licensed under MIT
 * 
 * Usage example:
 * 
 * var FAIR = new FAIRness_score()
 * FAIR.score() // returns an object with the four scorings { F: ..., A: ..., I: ..., R: ... }
 * FAIR.score_f() // returns the value of the Findability scoring
 * FAIR.score_a() // returns the value of the Accessbility scoring
 * FAIR.score_i() // returns the value of the Interoperability scoring
 * FAIR.score_r() // returns the value of the Reusability scoring
 * 
 */

function FAIRness_score() {
    const _version = "1.0"

    function round(score) {
        // rounding to 0-100 percentage, no decimals
        return Math.round(score * 100)
    }

    function avg(arr_numbers) {
        return arr_numbers.reduce((accum, value) => accum + value, 0) / arr_numbers.length
    }

    function max(arr_numbers) {
        return Math.max(...arr_numbers)
    }

    function score_f() {

        var F1 = tool.url_persistent == "Yes" ? 1 : 0
        var F2 = tool.documentation_available == "Yes" ? 1 : 0
        var F3 = tool.listed_other_databases == "Yes" ? 1 : 0

        return round((F1 + F2 + F3) / 3)
    }

    function score_a() {

        var A1 = 0
        if (tool.access_barrier.trim()) {
          A1 = {
            "No, direct download/access through a web link": 1,
            "User registration needed": 1,
            "Access to the tool needs to be granted (e.g. tool owner needs to give permission after user registration; tool owner sends tool after receiving a request email)": 0.5,
            "Access to the tool is evaluated before being granted, due to ethical, legal or contractual constrains (e.g. privacy, highly sensitive data)": 0.8
          }[tool.access_barrier]
        }

        var A2 = 0
        if (tool.documentation_accessible.trim()) {
          A2 = {
            "Yes": 1,
            "Some of it": 0.5,
            "No": 0,
            "Don't know": 0
          }[tool.documentation_accessible]
        }

        var A3 = 0
        if (tool.minimum_req) {
          var A3_scores = []
          var scores = {
            "Internet connection": 0.5,
            "Desktop computer (e.g. optimized for wider screens)": 1,
            "Mobile phone (e.g. works on small screens; use the camera)": 1,
            "Licensed software/programming language": 0,
            "Virtual reality headset or other specialized devices": 0.2,
            "Cross-platform tool (works in Windows, Mac and Linux)": 1,
            "Specific operating system: Windows": 0.5,
            "Specific operating system: Mac": 0.5,
            "Specific operating system: Linux": 0.5
          }
          for (var key in scores) {
            if (tool.minimum_req.includes(key)) {
                A3_scores.push(scores[key])
            }
          }
          A3 = avg(A3_scores)
        }

        var A4 = 0
        if (tool.languages && tool.languages.length > 0) {
            if (tool.languages.length > 3) {
                A4 = 1
            } else if (tool.languages.length == 3) {
                A4 = 0.8
            } else if (tool.languages.length == 2) {
                A4 = 0.5
            }
        }

        var A5 = 0
        if (tool.url_training_materials.trim()) {
          A5 = 1
        }

        return round((A1 + A2 + A3 + A4 + A5) / 5)
    }

    function score_i() {

        var subcriteria_count = 6

        var I1 = 0
        if (tool.software_proglanguage) {
          var I1_score = []
          for (prog_lang of tool.software_proglanguage) {
            var prog_lang_scores = {
              "C": 1,
              "C++": 1,
              "C#": 0.2,
              "Fortran": 0.2,
              "Java": 1,
              "Javascript": 1,
              "Julia": 1,
              "Matlab": 1,
              "Microsoft Excel": 0.8,
              "Perl": 0.2,
              "Python": 1,
              "R": 1,
              "Ruby": 1,
              "Ruby on Rails": 1,
              "React Native": 1,
              "TypeScript": 1,
              "Visual Basic / VBScript": 0.5,
              "Capsis platform": 1,
              "Oracle Apex": 0.2 // proprietary, paid
            }
            if (prog_lang in prog_lang_scores) {
              I1_score.push(prog_lang_scores[prog_lang])
            }
          }
          
          I1 = avg(I1_score)
        }
  
        var I2 = 0
        if (tool.input_data_protocols) {
            var I2_score = []
            var data_protocols = {
                "User enters the data directly manually": 0,
                "Data entry can be partially automated programmatically (e.g. loading files with previously defined setups)": 0.5,
                "Data entry can be fully automated programmatically (e.g. automatically run a script for multiple scenarios)": 1
            }
            for (var data_protocol in data_protocols) {
                if (tool.input_data_protocols.includes(data_protocol)) {
                    I2_score.push(data_protocols[data_protocol])
                }
            }
            I2 = max(I2_score)
        }
  
        var I3 = 0
        if (tool.input_data_formats && tool.input_data_formats.length > 0) {
            var I3_score = []
            var data_formats = {
                "Widely used file formats (CSV, JSON, XML, etc.)": 1,
                "Custom file formats": 0,
                "HTTP (query string parameters, data in request body & file uploads)": 1
            }
            for (var data_format in data_formats) {
                if (tool.input_data_formats.includes(data_format)) {
                    I3_score.push(data_formats[data_format])
                }
            }
            I3 = max(I3_score)
        }
  
        var I4 = 0
        if (tool.output_data_formats && tool.output_data_formats.length > 0) {
            var I4_score = []
            var data_formats = {
                "Widely used file formats (CSV, JSON, XML, etc.)": 1,
                "Custom file formats": 0,
                "Static content (e.g. reports on website pages, tables and graphs in the tool's interface, PDF files)": 0
            }
            for (var data_format in data_formats) {
                if (tool.output_data_formats.includes(data_format)) {
                    I4_score.push(data_formats[data_format])
                }
            }
            I4 = max(I4_score)
        }
  
        var I5 = 0
        if (tool.previous_versions_available) {
          I5 = {
            "Yes": 1,
            "No": 0,
            "Only one version exists": 0, // not scored
            "Don't know": 0
          }[tool.previous_versions_available]

          if (tool.previous_versions_available == "Only one version exists") subcriteria_count--
        }
  
        var I6 = 0
        if (tool.integrated_other_tools) {
          I6 = {
            "Yes": 1,
            "No": 0,
            "Don't know": 0
          }[tool.integrated_other_tools]
        }
        
        return round((I1 + I2 + I3 + I4 + I5 + I6) / count)
    }

    function score_r() {
        var R1 = 0
        if (tool.license.trim()) {
            R1 = {
                "MIT License": 1,
                "Apache License 2.0": 1,
                "GNU General Public License (GPL)": 1,
                "Creative Commons BY": 1,
                "Creative Commons BY-SA": 1,
                "Creative Commons BY-NC": 0.5,
                "Creative Commons BY-NC-SA": 0.5,
                "Creative Commons BY-ND": 0.2,
                "Creative Commons BY-NC-ND": 0.2,
                "Creative Commons Zero (CC0)": 1,
                "Proprietary": 0,
                "Not stated": 0,
                "Don't know": 0
            }[tool.license]
        }

        var R2 = 0
        if (tool.data_provenance.trim()) {
            R2 = {
                "Yes": 1,
                "Incomplete": 0.5,
                "No": 0,
                "Don't know": 0
            }[tool.data_provenance]
        }

        var R3 = 0
        if (tool.development_process.trim()) {
            R3 = {
                "Yes": 1,
                "Not completely": 0.5,
                "No": 0,
                "Don't know": 0
            }[tool.development_process]
        }

        var R4 = 0
        if (tool.documentation_contribute.trim()) {
            R4 = {
                "Yes": 1,
                "No": 0,
                "Don't know": 0
            }[tool.documentation_contribute]
        }

        return round((R1 + R2 + R3 + R4) / 4)
    }

    return {
        score(tool) {
            return {
                F: score_f(tool),
                A: score_a(tool),
                I: score_i(tool),
                R: score_r(tool)
            }
        },
        score_f: score_f,
        score_a: score_a,
        score_i: score_i,
        score_r: score_r
    }
}