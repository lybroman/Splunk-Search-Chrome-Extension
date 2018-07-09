function color_conversion(convert_color=false) {
    if(!convert_color) {
        let cur_style = document.getElementById("force_convert");
        if (cur_style){
            cur_style.remove();
        }
    }
    else
    {
        let css =
            'span.ace_function{color:#FFFFFF !important; background-color:#000000 !important; padding: 2px 0.5px 0px 0.5px !important}' +
            'span.ace_command {color:#000000 !important; background-color:#F0E442 !important; padding: 2px 0.5px 0px 0.5px !important}' +
            'span.ace_argument{color:#000000 !important; background-color:#D55E00 !important; padding: 2px 0.5px 0px 0.5px !important}' +
            'span.ace_modifier{color:#FFFFFF !important; background-color:#0072B2 !important; padding: 2px 0.5px 0px 0.5px !important}' +
            'pre.ace-spl-light{color:#000000 !important;}' +
            '.view---pages-enterprise---7-0-2---EXZlQ {color:#ffffff !important}' +
            '.badge---pages-enterprise---7-0-2---1od4- {color:#000000 !important; background:#ffffff !important}' +
            'i.icon-alert {color: #000000 !important}';

        let head = document.head;
        let style = document.createElement('style');
        style.type = 'text/css';
        style.id = "force_convert";
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
    }

}

function processText(){
    return ""
}

function render() {
    chrome.storage.sync.get('convert_color', function (obj) {
        color_conversion(obj.convert_color);
    });
}
