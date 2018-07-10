function SplunkMetaData() {
    // this.indexMap = new Map();
    this.indexList = [];
    this.sourceTypeList = [];
    this.fieldsList = [];
}

/*
SplunkMetaData.prototype.addIndex = function(indexName) {
    if (this.indexMap.has(indexName) == false) {
        this.indexMap.set(indexName , new Map());
    }
};

SplunkMetaData.prototype.addSourceType = function(indexName, sourceTypeName) {
    if (this.indexMap.has(indexName) == false) {
        this.indexMap.set(indexName , new Map());
    }
    if (this.indexMap.get(indexName).has(sourceTypeName) == false) {
        this.indexMap.get(indexName).set(sourceTypeName, new Set());
    }
};

SplunkMetaData.prototype.addFieldName = function(indexName, sourceTypeName, fieldName) {
    if (this.indexMap.has(indexName) == false) {
        this.indexMap.set(indexName , new Map());
    }
    if (this.indexMap.get(indexName).has(sourceTypeName) == false) {
        this.indexMap.get(indexName).set(sourceTypeName, new Set());
    }
    this.indexMap.get(indexName).get(sourceTypeName).add(fieldName);
};*/


SplunkMetaData.prototype.addIndex = function(indexName) {
    this.indexList.push(indexName);
};

SplunkMetaData.prototype.addSourceType = function(sourceType) {
    this.sourceTypeList.push(sourceType);
};

SplunkMetaData.prototype.addField = function(fieldName) {
    this.fieldsList.push(fieldName);
};


function lcs(string1 , string2) {

    let dp = new Array(string1.length);
    for (let i = 0;i < string1.length; i++) {
        dp[i] = new Array(string2.length);
        for (let j = 0;j < string2.length;j ++) {
            dp[i][j] = 0;
        }
    }

    for (let i = 0;i < string1.length;i ++) {
        if (string1[i] == string2[0]) {
            dp[i][0] = 1;
        } else {
            if (i > 0) {
                dp[i][0] = dp[i - 1][0];
            }
        }
    }
    for (let i = 0;i < string2.length;i ++) {
        if (string1[0] == string2[i]) {
            dp[0][i] = 1;
        } else {
            if (i > 0) {
                dp[0][i] = dp[0][i - 1];
            }
        }
    }
    for (let i = 1;i < string1.length;i ++) {
        for (let j = 1;j < string2.length;j ++) {
            if (string1[i] == string2[j]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j] , dp[i][j - 1]);
            }
        }
    }
    return dp[string1.length - 1][string2.length - 1];

}

SplunkMetaData.prototype.getIndexName = function(indexName) {

    let maxSim = - 1;
    let ans = '';
    for (let name of this.indexList) {
        let temp = lcs(name , indexName);
        if (temp > maxSim) {
            maxSim = temp;
            ans = name;
        } else if (temp == maxSim) {
            if (name.length < ans.length) {
                ans = name;
            }
        }
    }
    return ans;

};

SplunkMetaData.prototype.getSourceType = function(sourceType) {

    let maxSim = - 1;
    let ans = '';
    for (let name of this.sourceTypeList) {
        let temp = lcs(name, sourceType);
        if (temp > maxSim) {
            maxSim = temp;
            ans = name;
        } else if (temp == maxSim) {
            if (name.length < ans.length) {
                ans = name;
            }
        }
    }
    return ans;

};

SplunkMetaData.prototype.getFieldName = function(fieldName) {
    // TODO get correct field name


    return fieldName;
};


let highlight_check_box = document.getElementById('convert_color');
let audio_recorder = document.getElementById('recorder');
let started=false;
let bshow=false;
let workMode = "";
let recognition;
let b_highlight = false;
var SW;

// Move this part to somewhere else later

function get_key_words() {
    urls = {
        "indexes": "http://localhost:8000/en-US/splunkd/__raw/services/data/indexes?output_mode=json&count=-1",
        "sourcetypes": "http://localhost:8000/en-US/splunkd/__raw/services/saved/sourcetypes?output_mode=json&count=-1"
    }
    result = {}
    for (key in urls) {
        $.getJSON({
            url: urls[key],
            success: function(data){
                values = []
                for (idx in data["entry"]) {
                    values.push(data["entry"][idx]["name"])
                }
                result[key] = values;
            },
            async: false
        })
    }
    return result;
}


let splunkMetadata;
let splManager;

function searchInitialize() {

    let result = get_key_words();
    let indexes_list = result['indexes'];
    let sourcetype_list = result['sourcetypes'];

    splunkMetadata = new SplunkMetaData();
    splManager = new Spl();

    for (let indexName of indexes_list) {
        splunkMetadata.addIndex(indexName);
    }
    for (let sourcetype of sourcetype_list) {
        splunkMetadata.addSourceType(sourcetype);
    }

};

/**
 * spl class
 */
function Spl() {
    this.indexName = '*';
    this.sourceType = '*';

    this.statementFlag = false;

    this.pipeline = [];

    this.fieldsMap = new Map();
}

Spl.prototype.toUrlString = function() {

    // construct url from indexName, sourceType, pipeline and current fieldsMap
    let splString = '';

    splString += " | index = " + this.indexName;

    splString += " sourcetype = " + this.sourceType;

    for (let fMap of this.pipeline) {
        splString = splString + " | search " + this.getSplString(fMap);
    }

    if (this.fieldsMap.size > 0) {
        splString = splString + " | search " + this.getSplString(this.fieldsMap);
    }

    return splString;

};

Spl.prototype.getSplString = function(fieldsMap) {

    /**
     * get spl string from fieldsMap
     */
    const that = this;
    let ans = "";
    fieldsMap.forEach(function(field) {
        if (ans != "") {
            ans = ans + " ";
        }
        // binary field
        if ((field.fieldType == "or") || (field.fieldType == "and")) {
            let field1 = that.getSplStringForField(field.leftField);
            let field2 = that.getSplStringForField(field.rightField);
            ans += field1 + " " + field.fieldType.toUpperCase() + " " + field2;
        } else {
            ans += that.getSplStringForField(field);
        }
    });

    return ans;

};

Spl.prototype.getSplStringForField = function(field) {
    let ans = "";
    switch (field.fieldType) {
        case "contain":
            ans = "*" + field.fieldName + "*";
            break;
        case "equal":
            ans = field.fieldName + " = " + field.fieldValue;
            break;
        case "greater":
            ans = field.fieldName + " > " + field.fieldValue;
            break;
        case "less":
            ans = field.fieldName + " < " + field.fieldValue;
            break;
        case "search":
            ans = field.fieldValue;
            break;
    }
    return ans;
};

Spl.prototype.extractField = function(statement) {

    /*
        contains
        equals to
        greater than
        less than
        normal
     */
    let fieldName = '' , fieldValue = '' , fieldType = '';
    if (statement.match(/contain[s]?/i)) {
        let array = statement.split(/contain[s]?/);
        fieldName = array[0].trim();
        fieldValue = array[1].trim();
        fieldType = 'contain';
    } else if (statement.match(/equal[s]? to/i)) {
        let array = statement.split(/equal[s]? to/);
        fieldName = array[0].trim();
        fieldValue = array[1].trim();
        fieldType = 'equal';
    } else if (statement.match(/greater than/)) {
        let array = statement.split(/greater than/);
        fieldName = array[0].trim();
        fieldValue = array[1].trim();
        fieldType = 'greater';
    } else if (statement.match(/less than/)) {
        let array = statement.split(/less than/);
        fieldName = array[0].trim();
        fieldValue = array[1].trim();
        fieldType = 'less';
    } else {
        let value = this.getValue(statement);
        fieldName = 'search_' + value;
        fieldValue = value;
        fieldType = 'search';
    }

    return new Field(fieldName, fieldValue, fieldType);

};


Spl.prototype.getStatementType = function(statement, b_shortcut=false) {

    // first word
    let firstStatement = !b_shortcut ? statement.trim().split(/\s+/)[0] : statement;

    let statementTypeList = !b_shortcut ? ['index', 'type', 'commit', 'rollback', 'where', 'search'] : ['aloha commit', 'aloha rollback'];
    let maxSim = - 1;
    let ans = "";
    for (let type of statementTypeList) {
        if (soundex(type) === soundex(statement)){
            return type;
        }
        let sim = lcs(type, firstStatement);
        if (sim > maxSim) {
            maxSim = sim;
            ans = type;
        } else if (sim == maxSim) {
            if (type.length < ans.length) {
                ans = type;
            }
        }
    }
    return ans;

};

Spl.prototype.getValue = function(value) {

    if (value.trim() == '') {
        return '';
    } else {
        let strs = value.trim().split(/\s+/);
        return strs[strs.length - 1];
    }

};

Spl.prototype.addNewStatement = function(statement) {

    let words = statement.split(' ');
    let b_shortcut = false;

    if (words.length > 1 && "aloha" === words[0]) {
        b_shortcut = true;
        this.statementFlag = true;
    }
    else if("aloha" === words[0]){
        this.statementFlag = true;
        return false;
    }
    else if(words.length == 1){
        alert(statement + ' : ' + soundex(statement));
    }
    if (this.statementFlag) {
        this.statementFlag = false;
        // add a new statement
        let predicted_statement = this.getStatementType(statement, b_shortcut);
        alert("predicted:" + predicted_statement);
        if (predicted_statement === "index") {
            // index
            let array = statement.trim().split(/\s+/);
            if (array.length > 1) {
                let indexName = array[array.length - 1];
                this.indexName = splunkMetadata.getIndexName(indexName);
                // this.indexName = indexName;
            } else {
                document.getElementById("show_text").innerHTML = "please say a correct index";
                return false;
            }
        } else if (predicted_statement === "type") {
            // source type
            let array = statement.trim().split(/\s+/);
            if (array.length > 1) {
                let sourceType = array[array.length - 1];
                this.sourceType = splunkMetadata.getSourceType(sourceType);
                // this.sourceType = sourceType;
            } else {
                document.getElementById("show_text").innerHTML = "please say a correct source type";
                return false;
            }
        } else if (predicted_statement.includes("commit")) {
            if (this.fieldsMap.size > 0) {
                let newMap = new Map();
                this.fieldsMap.forEach(function (field, fieldName) {
                    newMap.set(fieldName, field);
                });
                this.pipeline.push(newMap);
                this.fieldsMap.clear();
            }
            return false;
        } else if (predicted_statement.includes("rollback")) {
            if (this.fieldsMap.size > 0) {
                this.fieldsMap.clear();
            } else {
                if (this.pipeline.length > 0) {
                    this.pipeline.pop();
                }
            }
        } else if (predicted_statement === 'where') {
            let strs = statement.trim().split(/\s+/);
            if (strs.length <= 1) {
                return false;
            }
            statement = "";
            for (let i = 1;i < strs.length;i ++) {
                if (i > 1) {
                    statement += " ";
                }
                statement += strs[i];
            }

            if (this.isBetweenStatement(statement)) {

                let strs = statement.trim().split(/between/);
                let temp = strs[1].split(/and/);

                let fieldValue1 = this.getValue(temp[0]);
                let fieldValue2 = this.getValue(temp[1]);
                let fieldName = this.getValue(strs[0]);

                // all fields are legal
                if (fieldName != '' && fieldValue1 != '' && fieldValue2 != '') {

                    // fieldName > fieldValue1 and fieldName < fieldValue2
                    let newStatement = "where " + fieldName + " greater than " + fieldValue1 + " and " + fieldName + " less than " + fieldValue2;
                    // alert(newStatement);
                    this.statementFlag = true;

                    return this.addNewStatement(newStatement);
                } else {
                    return false;
                }
            } else if (this.isBinaryFieldStatement(statement)) {
                let splitCharacter = "";
                if (statement.includes("or")) {
                    splitCharacter = "or";
                } else if (statement.includes("and")) {
                    splitCharacter = "and";
                }
                let strs = statement.split(splitCharacter);
                let leftField = this.extractField(strs[0]), rightField = this.extractField(strs[1]);

                let binaryField = new BinaryField(leftField.fieldName + "_" + splitCharacter + "_" + rightField.fieldName,
                    splitCharacter, leftField, rightField);

                this.fieldsMap.set(binaryField.fieldName, binaryField);
            } else {
                // single field
                let field = this.extractField(statement);
                this.fieldsMap.set(field.fieldName, field);
            }
        } else {
            // single field
            let field = this.extractField(statement);
            this.fieldsMap.set(field.fieldName, field);

            alert(field.fieldName + " " + field.fieldType + " " + field.fieldValue);
        }
        return true;
    } else {
        return false;
    }

};

Spl.prototype.isBinaryFieldStatement = function(statement) {

    if (statement.includes("or")) {
        return true;
    }
    if (statement.includes("and")) {
        return true;
    }
    return false;

};

Spl.prototype.isBetweenStatement = function(statement) {

    let index1 = statement.indexOf("between");
    let index2 = statement.indexOf("and");

    if (index1 >= 0 && index2 >= 0 && index1 < index2) {
        return true;
    } else {
        return false;
    }

};


function Field(fieldName, fieldValue, fieldType) {
    this.fieldName = fieldName;
    this.fieldValue = fieldValue;
    this.fieldType = fieldType;
}

function BinaryField(fieldName , fieldType, leftField, rightField) {
    this.fieldsName = fieldName;
    this.fieldType = fieldType;
    this.leftField = leftField;
    this.rightField = rightField;
}


/*
    chrome initialize
 */
audio_recorder.onclick = function() {
    if(!started) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function () {
            started = true;
            //document.getElementById("status").innerHTML = "start";
            SW.start();
            set_aloha_status(true);
        };

        recognition.onerror = function (event) {
            alert(event.error)
            started = false;
            SW.stop();
            set_aloha_status(false);
            //started = true;
            //document.getElementById("status").innerHTML = "start";
            //recognition.start();

            recognition.start();
            started = true;
        };

        recognition.onend = function () {
            //document.getElementById("status").innerHTML = "end";
            started = false;
            SW.stop();
            set_aloha_status(false);
            //started = true;
            //document.getElementById("status").innerHTML = "start";
            //recognition.start();
            recognition.start();
            started = true;
        };

        recognition.onresult = function (event) {
            let final_transcript = '';

            SW.stop();
            set_aloha_status(false);
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                final_transcript += event.results[i][0].transcript;
            }
            final_transcript = final_transcript.trim().toLowerCase();

            // for test here
            //final_transcript = testArray[testIndex];
            //alert("final_transcript " + final_transcript);
            testIndex ++;

            if (!bshow){
                show_comment_div();
                bshow = false;
            }
            update_comment(final_transcript, "just dummy comment...");
            voice_comment("just dummy comment");

            // alert(final_transcript);

            if (workMode == "") {
                if (final_transcript.trim().startsWith("let's have fun")) {
                    workMode = "search";
                    searchInitialize();
                    alert("start search");
                } else if (final_transcript.trim().startsWith("navigation")) {
                    workMode = "navigation";
                    alert("start navigation");
                }
            } else {
                if (workMode == "search") {
                    if (final_transcript.trim().startsWith("end search")) {
                        workMode = "";
                        alert("end search");
                    } else {
                        let addResult = splManager.addNewStatement(final_transcript.trim());
                        if (addResult) {
                            let spl = splManager.toUrlString();
                            // spl is legal
                            if (spl != '') {
                                let newURL = "http://localhost:8000/en-US/app/search/search?earliest=0&latest=&q=search%20" +
                                    encodeURI(spl) +
                                    "&display.page.search.mode=smart&dispatch.sample_ratio=1";

                                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                                    var tab = tabs[0];
                                    chrome.tabs.update(tab.id, {url: newURL});
                                });
                                // chrome.tabs.create({ url: newURL });
                            }
                        }
                        document.getElementById("show_text").innerHTML = splManager.toUrlString();
                    }
                } else if (workMode == "navigation") {
                    if (final_transcript.trim().startsWith("end navigation")) {
                        workMode = "";
                    } else {
                        // TODO add navigation

                        alert("end navigation");
                    }
                }
            }
        };
        recognition.start();
    }
    else
    {
        recognition.stop();
    }
};

highlight_check_box.onclick  = function() {

    chrome.storage.sync.set({convert_color: !b_highlight}, function() {
        let icon_highlight = $('#convert_color');
        if (icon_highlight.hasClass('off')) {
            icon_highlight.removeClass('off');
            icon_highlight.addClass('on');
        }
        else
        {
            icon_highlight.addClass('off');
            icon_highlight.removeClass('on')
        }
        b_highlight = !b_highlight;
    });


    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        chrome.tabs.executeScript(tab.id, {
            code : 'render()'
        }, function() {});
    });
};

$(function() {
    chrome.storage.sync.get('convert_color', function (obj) {
        let icon_highlight = $('#convert_color');
        if(obj.convert_color){
            icon_highlight.removeClass('off');
            icon_highlight.addClass('on');
        }
        b_highlight = obj.convert_color;
    });

    SW = new SiriWave({
        width: 40,
        height: 15,
        speed: 0.05,
        amplitude: 1,
        //style: "ios9",
        container: document.getElementById('siric'),
        autostart: false,
        color: "#000"
    });
});


let testIndex = 0;
let testArray = [
                 "let's have fun",
    "aloha","index is internet",
    "aloha","type is splunkd",
    "aloha","commit",
    "aloha","where group equals to queue",
    "aloha","where group equals to test",
    "aloha","where group equals to queue",
    "aloha","where current_size greater than 0",
    "aloha","where current_size equals to 0",
    "aloha","commit",
    "aloha","where name equals to typingqueue and max_size_kb equals to 500",
    "aloha", "commit",
    "aloha","where largest_size between 10 and 20",
    "aloha","where largest_size greater than 5 and largest_size less than 10",
    "aloha","commit",
    "aloha", "search info",
    "aloha","commit", "aloha","search test" , "aloha","rollback" , "aloha","rollback" , "aloha",'rollback' , '"aloha", rollback', 'end search'
];