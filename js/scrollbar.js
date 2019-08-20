const style = document.createElement("style");
style.innerHTML = "/*- scrollbar -*/\n" +
    "::-webkit-scrollbar {\n" +
    "    width: 5px;\n" +
    "    height: 5px;\n" +
    "}\n" +
    "::-webkit-scrollbar-thumb{\n" +
    "    background-color: #999;\n" +
    "    -webkit-border-radius: 5px;\n" +
    "    border-radius: 5px;\n" +
    "}\n" +
    "::-webkit-scrollbar-thumb:vertical:hover{\n" +
    "    background-color: #666;\n" +
    "}\n" +
    "::-webkit-scrollbar-thumb:vertical:active{\n" +
    "    background-color: #333;\n" +
    "}\n" +
    "::-webkit-scrollbar-button{\n" +
    "    display: none;\n" +
    "}\n" +
    "::-webkit-scrollbar-track{\n" +
    "    background-color: #f1f1f1;\n" +
    "}\n" +
    "/*- scrollbar -*/";
document.head.appendChild(style);