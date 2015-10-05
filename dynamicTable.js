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

function hasClass(element, className) {
    if (typeof element !== 'object' || typeof element.className === 'undefined') {
        return false;
    }
    
    var classes = String(element.className).split(' ');
    for (var x in classes) {
        if (classes[x] === String(className)) {
            return true;
        }
    }
    
    return false;
}

function addClass(element, className) {
    if (typeof element !== 'object') {
        return false;
    }
    
    var  classes = '';
    if (typeof element.className !== 'undefined') {
        classes = String(element.className).split(' ');
    }
    
    
    for (var x in classes) {
        if (classes[x] === String(className)) {
            return true;
        }
    }
    
    classes[classes.length] = className;
    element.className = classes.join(' ');
    
    return true;
}

function removeClass(element, className) {
    if (typeof element !== 'object') {
        return false;
    }
    
    var  classes = '';
    if (typeof element.className !== 'undefined') {
        classes = String(element.className).split(' ');
    }
    
    for (var x in classes) {
        if (classes[x] === String(className)) {
            delete classes[x];
        }
    }
    var newClassName = classes.join(' ');
    element.className = newClassName.trim();
    
    return true;
}

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
    
    this.TYPE_ASC = 0;
    this.TYPE_DESC = 1;
    
    this.columnIndexes = {};
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
        
        /**
         * TODO CLEAR PAGINATION;
         */
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
            var that = this;
            
            for (var i=1; i<=pages; i++) {
                var tmpElement = newElement('li', { innerHTML: i, 'data-page': i, class: 'test'});
                
                tmpElement.addEventListener('click', function() {
                    that.showPage(parseInt(this.dataset.page));
                });
                this.paginationElement.insertBefore(tmpElement, nextElement);
            }
            
            this.paginationPrevElement.addEventListener('click', function() {
                if (that.page > 1) {
                    that.showPage(that.page-1);
                }
            });
            this.paginationNextElement.addEventListener('click', function() {
                if (that.page < Math.ceil(elementsAmount/perPage)) {
                    that.showPage(that.page+1);
                }
            });
            
            this.showPage(1);
        }        
    };
    
    this.showPage = function(pageNumber) {
        var children = this.bodyElement.children;
        
        var perPage = parseInt(this.config.pagination.perPage);
        var elementsAmount = this.data.length;
        var pages = Math.ceil(elementsAmount/perPage);
        
        if (pageNumber > pages || pageNumber < 1) {
            throw 'Taka strona nie istnieje!';
        }

        this.page = pageNumber;
        
        var i = 0;
        for (var x in children) {
            if (String(children[x].tagName).toLowerCase() === 'tr') {
                if (i >= ((pageNumber-1)*perPage) && i < (pageNumber*perPage)) {
                    children[x].style.display = 'table-row';                    
                } else {
                    children[x].style.display = 'none';
                }
            }
            
            i++;
        }
        
        var pChildren = this.paginationElement.children;
        for (var x in pChildren) {
            if (String(pChildren[x].tagName).toLowerCase() === 'li') {
                if (typeof pChildren[x].dataset !== 'undefined' && typeof pChildren[x].dataset.page !== 'undefined' && parseInt(pChildren[x].dataset.page) === parseInt(pageNumber)) {
                    addClass(pChildren[x], 'active');
                } else {
                    removeClass(pChildren[x], 'active');
                }
            }
        }
    };
    
    this.sortData = function(type, column) {
        var colIndex = this.columnIndexes[column];
        var oldOrder = {};
        var newOrder = 1;
        
        for (var x in this.data) {
            oldOrder[this.data[x][colIndex]] = x;
            
        }
    };
    
    this.bindEvents = function() {        
        var that = this;
        for(var x in this.header) {
            if (typeof this.header[x].sort !== 'undefined' && typeof this.header[x].sort.up !== 'undefined' && typeof this.header[x].sort.down !== 'undefined') {
                this.header[x].sort.up.addEventListener('click', function() {
                    that.sortData(that.TYPE_ASC, this.dataset.column);
                });
                this.header[x].sort.down.addEventListener('click', function() {
                    that.sortData(that.TYPE_DESC, this.dataset.column);
                });
            }
        }
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
                
                this.columnIndexes[thisId] = i;
                
                if (typeof columns[thisId] !== 'undefined') {
                    if (typeof columns[thisId].sort !== 'undefined' && typeof columns[thisId].sort.up !== 'undefined' && typeof columns[thisId].sort.down !== 'undefiend') {
                        this.header[i].sort = {};
                        this.header[i].sort.up = document.getElementById(columns[thisId].sort.up);
                        this.header[i].sort.down = document.getElementById(columns[thisId].sort.down);
                        this.header[i].sort.up.dataset.column = thisId;
                        this.header[i].sort.down.dataset.column = thisId;
                    }
                }
         
                i++;
            }
            break;
        }
    };
}