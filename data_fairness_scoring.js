/*!
 * FAIRness scoring algorithm for data
 *
 * Licensed under MIT
 * 
 * Usage example:
 * 
 * var FAIR = new Data_FAIRness_scoring()
 * FAIR.score(data) // returns an object with the four scorings { F: ..., A: ..., I: ..., R: ... }
 * FAIR.score_f(data) // returns the value of the Findability scoring
 * FAIR.score_a(data) // returns the value of the Accessbility scoring
 * FAIR.score_i(data) // returns the value of the Interoperability scoring
 * FAIR.score_r(data) // returns the value of the Reusability scoring
 * 
 * The 'data' should be an Object containing the needed information from the 'data_form.json'
 * 
 */

function Data_FAIRness_scoring() {
    const _version = "1.0"

    const DEFAULT_SCORE_FOR_OTHER_ANSWERS = 0.2

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

    function validAnswer(str) {
        str = str.trim()
        return str !== null || str !== "null" || str !== "" || str !== undefined
    }

    function score_f(data) {

        var F1 = data.url_persistent == "Yes" ? 1 : 0
        var F2 = data.data_metadata == "Yes" ? 1 : 0
        var F3 = data.listed_other_databases == "Yes" ? 1 : 0

        return round((F1 + F2 + F3) / 3)
    }

    function score_a(data) {

        var A1 = 0
        if (data.access_barrier) {
          A1 = {
            "No, direct download/access through a web link": 1,
            "User registration needed": 1,
            "Access to the data needs to be granted (e.g. dataset owner needs to give permission after user registration; dataset owner sends data after receiving a request email)": 0.5,
            "Access to the data is evaluated before being granted, due to ethical, legal or contractual constrains (e.g. privacy, highly sensitive data)": 0.8
          }[data.access_barrier]
        }

        var A2 = 0
        if (data.documentation_accessible) {
          A2 = {
            "Yes": 1,
            "Some of it": 0.5,
            "No": 0,
            "Don't know": 0
          }[data.documentation_accessible]
        }

        return round((A1 + A2) / 2)
    }

    function score_i(data) {

        var I1 = 0
        if (data.data_formats && data.data_formats.length > 0) {
            var I1_score = []
            var scores = {
                "Widely used file formats (CSV, JSON, GeoJSON, XML, TIFF, MP3, MP4, etc.)": 1,
                "Custom file formats (database specific, not widely used)": 0,
                "Static content (e.g. textual, reports on website pages, tables and graphs, PDF files)": 0,
                "Other": DEFAULT_SCORE_FOR_OTHER_ANSWERS
            }
            for (var data_format of data.data_formats) {
              if (data_format in scores) {
                I1_score.push(scores[data_format])
              } else if (validAnswer(data_format)) {
                  // other option
                  I1_score.push(DEFAULT_SCORE_FOR_OTHER_ANSWERS)
              }
            }
            I1 = max(I1_score)
        }
  
        var I2 = 0
        if (data.data_metadata_vocabulary) {
          I2 = {
            "Yes": 1,
            "No": 0,
            "Don't know": 0
          }[data.data_metadata_vocabulary]
        }
        
        return round((I1 + I2) / 2)
    }

    function score_r(data) {
        
        var R1 = 0
        if (data.data_relevant_attributes) {
            R1 = {
                "Yes": 1,
                "Not completely": 0.5,
                "No": 0,
                "Don't know": 0
            }[data.data_relevant_attributes]
        }       
        
        var R2 = 0
        if (data.license) {
            var scores = {
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
                "Don't know": 0,
                "Other": DEFAULT_SCORE_FOR_OTHER_ANSWERS
            }
            if (data.license in scores) {
                R2 = scores[data.license]
            } else if (validAnswer(data.license)) {
                // other option
                R2 = DEFAULT_SCORE_FOR_OTHER_ANSWERS
            }
        }

        var R3 = 0
        if (data.development_process) {
            R3 = {
                "Yes": 1,
                "Not completely": 0.5,
                "No": 0,
                "Don't know": 0
            }[data.development_process]
        }       

        return round((R1 + R2 + R3) / 3)
    }

    return {
        score(data) {
            return {
                F: score_f(data),
                A: score_a(data),
                I: score_i(data),
                R: score_r(data)
            }
        },
        score_f: score_f,
        score_a: score_a,
        score_i: score_i,
        score_r: score_r
    }
}