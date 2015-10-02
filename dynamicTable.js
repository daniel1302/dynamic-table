function DynamicTable() {
    this.config = {
        columns: {}      
    };
    this.tableContainer = null;
    this.header = null;
    
    this.init = function(tableContainer, config) {
        if (typeof tableContainer !== 'object') {
            throw 'Przeakż poprawny obiekt tabelki';
        }
        
        this.tableContainer = tableContainer;
        
        this.getHeaderDescription();
        this.bindEvents();
    };
    
    this.clear = function() {
        
    };
    
    this.draw = function() {
        
    };
    
    this.bindEvents = function() {
        
    };
    
    this.setData = function(data) {
        
    };
    
    this.getHeaderDescription = function() {        
        var children    = this.tableContainer.children;
        var header      = null;
        
        for (var x in children) {
            if (String(children[x].tagName).toLowerCase() === 'thead') {
                header = children[x];
                break;
            }
        }
        
        if (header === null) {
            throw 'Tabelka nie ma poprawnego nagłówka';
        }
        
        var headerElements = header.children;
        
        for (var x in headerElements) {
            if (String(children[x].tagName).toLowerCase() === 'tr') {
                continue;
            }
            for (var y in headerElements[x]) {
                if (String(headerElements[x][y].tagName).toLowerCase() === 'td') {
                    continue;
                }
                this.header[] = {
                    element: headerElements[x][y],
                    sort: { 
                }
            }
            break;
        }
    };
}