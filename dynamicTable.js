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

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function DynamicTable() {
    this.config = {
        pagination: {
            perPage: 4,
            id: 'pages',
            prev: 'pages-prev',
            next: 'pages-next'
        },
        columns: {},
        find: {}
    };
    
    this.SORT_TYPE_ASC = 0;
    this.SORT_TYPE_DESC = 1;
    
    this.columnIndexes = {};
    this.tableContainer = null;
    this.header = null;
    this.headerElement = null;
    this.bodyElement = null;
    this.data = null;
    this.styles = [];
    this.paginationElement = null;
    this.paginationPrevElement = null;
    this.paginationNextElement = null;
    this.activeRows = [];
    this.rowsAmount = 0;
    this.enablePagination = 0;
    
    this.init = function(tableContainer, config) {
        if (typeof tableContainer !== 'object') {
            throw 'Przeakż poprawny obiekt tabelki';
        }
        
        this.config.columns     = config.columns;        
        this.config.pagination  = config.pagination;
        this.config.find        = config.find;
        
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
        this.activeRows = [];
        
        if (this.paginationElement !== null) {
            var pChildren = this.paginationElement.children;
            var toDelete = [];
            for (var x in pChildren) {
                if (typeof pChildren[x] !== 'undefined' && typeof pChildren[x].dataset !== 'undefined' && typeof pChildren[x].dataset.page !== 'undefined') {
                    toDelete[toDelete.length] = pChildren[x];
                    
                }
            }
            for (var i=0;i<toDelete.length;i++) {
                this.paginationElement.removeChild(toDelete[i]);
            }
        }
    };
    
    this.drawRow = function(dataIndex) {
        if (typeof this.data[dataIndex] === 'undefined') {
            throw 'Próbujesz rysować nieistniejący wiersz z danymi';
        }
        if (this.activeRows.length > 0 && this.activeRows.indexOf(parseInt(dataIndex)) < 0) {
            return false;
        }
        
        var tr = newElement('tr', {});
            
        if (typeof this.styles[dataIndex] !== 'undefined' && typeof this.styles[dataIndex].style !== 'undefined') {
            for (var j in this.styles[dataIndex].style) {
                tr.style[j] = this.styles[dataIndex].style[j];
            }
        }
        for (var y in this.data[dataIndex]) {
            var tmpTd = newElement('td', {
                innerHTML: this.data[dataIndex][y]
            });

            if (typeof this.styles[dataIndex] !== 'undefined' && typeof this.styles[dataIndex][y] !== 'undefined' && typeof this.styles[dataIndex][y].style !== 'undefined') {
                for (var j in this.styles[dataIndex][y].style) {
                    tmpTd.style[j] = this.styles[dataIndex][y].style[j];
                }
            }
            tr.appendChild(tmpTd);

        }
        this.bodyElement.appendChild(tr);
    };
    
    this.draw = function() {
        for (var x in this.data) {
            this.drawRow(x);
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
        
        this.enablePagination = 1;
        this.countRows();
        
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
                
        this.drawPagesList();
        this.showPage(1);
    };
    
    this.drawPagesList = function() {
        if (this.enablePagination === 0) {
            return false;
        }
        
        var perPage = parseInt(this.config.pagination.perPage);
        if (perPage >= this.rowsAmount) {
            this.paginationElement.style.display = 'none';
        } else {
            this.paginationElement.style.display = 'block';
            
            var pages = Math.ceil(this.rowsAmount/perPage);
            var that = this;
            
            for (var i=1; i<=pages; i++) {
                var tmpElement = newElement('li', { innerHTML: i, 'data-page': i, class: 'test'});
                
                tmpElement.addEventListener('click', function() {
                    that.showPage(parseInt(this.dataset.page));
                });
                this.paginationElement.insertBefore(tmpElement, this.paginationNextElement);
            }
            
            this.paginationPrevElement.addEventListener('click', function() {
                if (that.page > 1) {
                    that.showPage(that.page-1);
                }
            });
            this.paginationNextElement.addEventListener('click', function() {
                if (that.page < Math.ceil(that.rowsAmount/perPage)) {
                    that.showPage(that.page+1);
                }
            });   
        }
    };
    
    this.showPage = function(pageNumber) {
        if (this.enablePagination === 0) {
            return false;
        }
        
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
        var newOrder = [];
        var newActiveRows = [];
        
        var i=0;
        for (var x in this.data) {
            var newValue = this.data[x][colIndex]+'_'+(i++);
            oldOrder[newValue] = x;
            newOrder[newOrder.length] = newValue;
        }
        
        newOrder.sort();
        if (type === this.SORT_TYPE_DESC) {
            newOrder.reverse();
        }
        
        var newData = [];
        var newStyles = [];
        for (var x in newOrder) {
            var rowIndex = newData.length;
            newData[rowIndex] = this.data[oldOrder[newOrder[x]]];
            newStyles[rowIndex] = this.styles[oldOrder[newOrder[x]]];
            if (this.activeRows.indexOf(parseInt(oldOrder[newOrder[x]])) >= 0) {
                newActiveRows[newActiveRows.length] = rowIndex;
            }
        }

        this.data = newData;
        this.styles = newStyles;
        this.clear();
        this.activeRows = newActiveRows;
        this.draw();
        this.drawPagesList();
        this.showPage(1);
    };
    
    this.getData = function() {
        var children = this.bodyElement.children;
        if (this.data === null) {
            this.data = [];
        }
        
        for (var x in children) {
            if (String(children[x].tagName).toLowerCase() !== 'tr') {
                continue;
            }
            var recordIndex = this.data.length;
            this.styles[recordIndex] = {};
            this.styles[recordIndex]['style'] = children[x].style;
            
            var tmpDataRow = [];
            var rowChildren = children[x].children;
            for (var y in rowChildren) {
                if (String(rowChildren[y].tagName).toLowerCase() !== 'td') {
                    continue;
                }
                var tmpIndex = tmpDataRow.length;
                tmpDataRow[tmpIndex] = rowChildren[y].innerHTML;
                this.styles[recordIndex][tmpIndex] = {};
                this.styles[recordIndex][tmpIndex]['style'] = rowChildren[y].style;
            }
            this.data[recordIndex] = tmpDataRow;
        }
    };
    
    this.matchField = function(findIndex, rowIndex) {
        if (typeof this.config.find[findIndex] === 'undefined') {
            throw 'Niewłaściwa reguła wyszukiwania';
        }
        if (typeof this.data[rowIndex] === 'undefined') {
            throw 'Próbujesz wyszukiwać w nieistniejącym wierszu.';
        }
        
        var findType = '';
        if (typeof this.config.find[findIndex].type !== 'string') {
            findType = 'separated';
        } else {
            findType = this.config.find[findIndex].type;
        }
        
        var findString = document.getElementById(findIndex).value;        
        var regexp = new RegExp('(.*)?'+findString+'(.*)?', 'i');
        
        switch (findType) {
            case 'combined' :
                var value = '';
                for (var x in this.config.find[findIndex].columns) {
                    var col = this.config.find[findIndex].columns[x];
                    if (typeof this.columnIndexes[col] !== 'undefined') {
                        value += ' ';
                        value += this.data[rowIndex][this.columnIndexes[col]];
                    }
                }
                if (regexp.test(value) === false) {
                    return false;
                }
                break;
            default:
                for(var x in this.config.find[findIndex].columns) {
                    var col = this.config.find[findIndex].columns[x];
                    if (regexp.test(this.data[rowIndex][this.columnIndexes[col]]) === true) {
                        return true;
                    }
                }
                
                return false;
                break;
        }
        
        return true;
    };
    
    this.matchRow = function(rowIndex) {
        if (typeof this.data[rowIndex] === 'undefined') {
            throw 'Próbujesz wyszukiwać w nieistniejącym wierszu.';
        }
          
        for (var x in this.config.find) {
            if (this.config.find[x] === null || typeof this.config.find[x] === 'undefined') {
                continue;
            }
            
            if (this.matchField(x, rowIndex) === false) {
                return false;
            }
        }        
        
        return true;
    };
    
    this.findInTable = function() {        
        this.clear();
        this.activeRows[0] = null;
        for (var x in this.data) {
            if (this.matchRow(x) !== false) {
                this.activeRows[this.activeRows.length] = parseInt(x);
            }
        }
        
        this.draw();
        this.countRows();
        this.drawPagesList();
        this.showPage(1);
    };
    
    this.countRows = function(amount) {
        if (typeof amount === 'number') {
            this.rowsAmount = parseInt(amount);
            return;
        }
        
        if (this.activeRows.length > 0) {
            this.rowsAmount = this.activeRows.length;
            if (this.activeRows[0] === null) {
                this.rowsAmount -= 1;
            }
            return;
        }
        
        this.rowsAmount = parseInt(this.data.length);
        
    };
    
    this.bindEvents = function() {        
        var that = this;
        for(var x in this.header) {
            if (typeof this.header[x].sort !== 'undefined' && typeof this.header[x].sort.up !== 'undefined' && typeof this.header[x].sort.down !== 'undefined') {
                this.header[x].sort.up.addEventListener('click', function() {
                    that.sortData(that.SORT_TYPE_ASC, this.dataset.column);
                });
                this.header[x].sort.down.addEventListener('click', function() {
                    that.sortData(that.SORT_TYPE_DESC, this.dataset.column);
                });
            }
        }
        
        var findConfig = this.config.find;
        for (var x in findConfig) {
            var tmpElement = document.getElementById(x);
            
            if (typeof tmpElement === 'undefined' || tmpElement === null) {
                delete this.config.find[x];
                continue;
            }
            tmpElement.addEventListener('keyup', function(e) {
                that.findInTable();
            });
        }
    };
    
    this.setData = function(data) {
        if (this.header === null) {
            throw 'Nie zainicjowano tabeli funkcją init()';
        }
        
        if (this.data === null) {
            this.data = [];
        }
        
        var i = this.data.length;
        var headerLength = this.header.length;
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
                if (String(trElements[y].tagName).toLowerCase() !== 'td' || (parseInt(y)>=0) === false) {
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