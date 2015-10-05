var newElement = function(name, attr) {
    var tmp = document.createElement(name);
    for (var k in attr) {
        if (k === 'style') {
            for (var s in attr[k]) {
                tmp.style[s] = attr[k][s]; 
            }
        } else if (k === 'innerHTML') {
            tmp.innerHTML = attr[k];
        } else {
            tmp.setAttributeNS(null, k, attr[k]);
        }
    }
    
    return tmp;
};

function DynamicTable() {
    this.config = {
        pagination: {
            perPage: 2,
            id: 'pages',
            prev: 'pages-prev',
            next: 'pages-next'
        },
        columns: {}      
    };
    this.tableContainer = null;
    this.header = null;
    this.headerElement = null;
    this.bodyElement = null;
    this.data = null;
    this.paginationElement = null;
    this.paginationPrevElement = null;
    this.paginationNextElement = null;
    
    this.init = function(tableContainer, config) {
        if (typeof tableContainer !== 'object') {
            throw 'Przeakż poprawny obiekt tabelki';
        }
        
        this.config.columns = config.columns;
        
        this.tableContainer = tableContainer;
        
        this.getHeaderDescription();
        this.bindEvents();
        this.testBody();
    };
    
    this.testBody = function () {
        var children = this.tableContainer.children;
        for (var x in children) {
            if (String(children[x].tagName).toLowerCase() === 'tbody') {
                this.bodyElement = children[x];
                break;
            }
        }
        
        if (this.bodyElement === null) {
            this.bodyElement = newElement('tbody', {});
            this.tableContainer.appendChild(this.bodyElement);
        }
    };
    
    this.clear = function() {
        this.bodyElement.innerHTML = '';
    };
    
    this.draw = function() {
        for (var x in this.data) {
            var tr = newElement('tr', {});
            
            for (var y in this.data[x]) {
                tr.appendChild(newElement('td', {
                    innerHTML: this.data[x][y]
                }));
               
            }
            this.bodyElement.appendChild(tr);
        }
    };
    
    this.pagination = function() {
        var config = this.config.pagination;
        
        if (typeof config.perPage === 'undefined' || typeof config.id === 'undefined' || typeof config.prev === 'undefined' || typeof config.next === 'undefined') {
            throw 'Aby uruchomić paginacje musisz ją poprawnie skonfigurować.'
        }
        
        var paginationElement = document.getElementById(config.id);
        if (typeof paginationElement === 'undefined') {
            throw 'Nie zdefiniowano elementu paginacji';
        }
        
        var paginationElementTag = String(paginationElement.tagName).toLowerCase();
        
        if (paginationElementTag !== 'ul' && paginationElementTag !== 'ol') {
            this.paginationElement = newElement('ul', {});
            paginationElement.appendChild(this.paginationElement);
        } else {
            this.paginationElement = paginationElement;
        }       
        
        var prevElement = document.getElementById(config.prev);
        var nextElement = document.getElementById(config.next);

        if (prevElement === null || nextElement === null) {
            this.paginationElement.innerHTML = '';
            prevElement = newElement('li', { innerHTML: '<' });
            nextElement = newElement('li', { innerHTML: '>' });
            this.paginationElement.appendChild(prevElement);
            this.paginationElement.appendChild(nextElement);
        }
        
        this.paginationPrevElement = prevElement;
        this.paginationNextElement = nextElement;
                
        var perPage = parseInt(config.perPage);
        var elementsAmount = this.data.length;
        if (perPage > elementsAmount) {
            this.paginationElement.style.display = 'none';
        } else {
            this.paginationElement.style.display = 'block';
            
            var pages = Math.ceil(elementsAmount/perPage);
           
            for (var i=1; i<=pages; i++) {
                this.paginationElement.insertBefore(newElement('li', {
                    innerHTML: i
                }), nextElement);
            }
        }
        
        this.showPage(0);
    };
    
    this.showPage = function(pageNumber) {
        var children = this.bodyElement.children;
        
        var perPage = parseInt(this.config.pagination.perPage);
        var elementsAmount = this.data.length;
        var pages = Math.ceil(elementsAmount/perPage);
        
        if (pageNumber > pages) {
            throw 'Taka strona nie istnieje!';
        }
        console.log(children);
        var i = 0;
        for (var x in children) {
            if (String(children[x].tagName).toLowerCase() === 'tr' && i >= ((pageNumber-1)*perPage) && i < (pageNumber*perPage)) {
                console.log('Pokazuje');
            }
            i++;
        }
    }
    
    this.bindEvents = function() {
        
    };
    
    this.setData = function(data) {
        if (this.header === null) {
            throw 'Nie zainicjowano tabeli funkcją init()';
        }
        
        var i = 0;
        var headerLength = this.header.length;
        this.data = [];
        for (var x in data) {
            if (data[x].length === headerLength) {
                this.data[i++] = data[x];
            }
        }
    };
    
    this.getHeaderDescription = function() {        
        var children    = this.tableContainer.children;
        var header      = null;
        
        for (var x in children) {
            if (String(children[x].tagName).toLowerCase() === 'thead') {
                this.headerElement = header = children[x];
                break;
            }
        }
        
        if (header === null) {
            throw 'Tabelka nie ma poprawnego nagłówka';
        }
        
        var columns = this.config.columns;
        
        var headerElements = header.children;
        var i = 0;
        this.header = [];
        
        for (var x in headerElements) {
            if (String(headerElements[x].tagName).toLowerCase() !== 'tr') {
                continue;
            }
            var trElements = headerElements[x].children;
            for (var y in trElements) {
               
                if (String(trElements[y].tagName).toLowerCase() !== 'td') {
                    continue;
                }
                
                this.header[i] = {
                    element: trElements[y]
                };
                var thisId = trElements[y].id;
                
                if (typeof columns[thisId] !== 'undefined') {
                    if (typeof columns[thisId].sort !== 'undefined' && typeof columns[thisId].sort.up !== 'undefined' && typeof columns[thisId].sort.down !== 'undefiend') {
                        this.header[i].sort = {};
                        this.header[i].sort.up = document.getElementById(columns[thisId].sort.up); 
                        this.header[i].sort.down = document.getElementById(columns[thisId].sort.down);
                    }                    
                }
         
                i++;
            }
            break;
        }
    };
}