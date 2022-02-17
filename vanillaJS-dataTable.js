//https://getbootstrap.com/docs/5.0/components/pagination/
//https://stackoverflow.com/questions/52919972/javascript-populate-table
//https://getbootstrap.com/docs/5.1/content/tables/
//https://cb1ijc.axshare.com/#id=cy9yfw&p=consultar_protocolos&g=1

class DataTable {
    #currentPage;

    constructor(tableId, setDefaultButtonsPaginated) {
        this.tableId = tableId;
        this.#currentPage = 1;
        this.rowsCount = document.getElementById(tableId).getElementsByTagName('tbody')[0].rows.length; //se não existir, cria

        if (setDefaultButtonsPaginated) {
            this.#setDefaultButtonsPaginated();
        }
    }

    getCurrentPage() {
        return this.#currentPage;
    }

    setCurrentPage(value) {
        this.#currentPage = value;
    }

    setRows(rowsCount, table) {
        if (rowsCount == this.rowsCount)
            return;

        if (rowsCount > this.rowsCount) {
            let count = rowsCount - this.rowsCount;
            this.#addRows(count, table);
        }

        if (rowsCount < this.rowsCount) {
            let count = this.rowsCount - rowsCount;
            this.#removeRows(count, table);
        }

        this.rowsCount = rowsCount;
    }

    #addRows(count, table) {
        for (let i = 0; i < count; i++) {
            table.insertRow();
        }
    }

    #removeRows(count, table) {
        for (let i = 0; i < count; i++) {
            table.deleteRow(table.rows.length - 1);
        }
    }

    setCells(cellCount, row) {
        if (cellCount == row.cells.length)
            return;

        if (cellCount > row.cells.length) {
            let count = cellCount - row.cells.length;
            this.#addCells(count, row);
        }

        if (cellCount < row.cells.length) {
            let count = row.cells.length - cellCount;
            this.#removeCells(count, row);
        }

        return cellCount;
    }

    #addCells(count, row) {
        for (let i = 0; i < count; i++) {
            row.insertCell(0);
        }
    }

    #removeCells(count, row) {
        for (let i = 0; i < count; i++) {
            row.deleteCell(row.cells.length - 1);
        }
    }

    #setDefaultButtonsPaginated() {
        let table = document.getElementById(this.tableId);
        table.outerHTML += '<nav id="navPagination" aria-label="Pagination"><ul class="pagination"><li class="page-item"><a class="page-link" id="previous" href="#">Previous</a></li><li class="page-item"><a class="page-link" name="numberPagination" href="#">1</a></li><li class="page-item"><a class="page-link" name="numberPagination" href="#">2</a></li><li class="page-item"><a class="page-link" name="numberPagination" href="#">3</a></li><li class="page-item"><a class="page-link" id="next" href="#">Next</a></li></ul></nav>';
        this.setButtonsPaginated(true);
    }

    setButtonsPaginated(keepOldNavPagination, totalCount) {
        if (!keepOldNavPagination) {
            let navPagination = document.getElementById('navPagination');
            if (!!navPagination) {
                navPagination.remove();
            }
        }

        let previousElement = document.getElementById('previous');
        let nextElement = document.getElementById('next');

        let previousPageEvent = new CustomEvent("previousPageEvent", { detail: { sender: this, page: this.#currentPage } });
        let nextPageEvent = new CustomEvent("nextPageEvent", { detail: { sender: this, page: this.#currentPage } });

        if (this.#currentPage === 1) {
            previousElement.setAttribute("disabled", "disabled");
        }

        this.#changeInteractionButtonsPaginated(totalCount, previousElement, nextElement);

        if (!!previousElement) {
            previousElement.onclick = () => {

                if (this.#currentPage > 1) {
                    this.#currentPage--;
                }

                this.#changeInteractionButtonsPaginated(totalCount, previousElement, nextElement);

                document.dispatchEvent(previousPageEvent);
            };
        }
        else {
            console.error("Element with id 'previous' does not exist.");
        }

        if (this.#currentPage >= (totalCount / this.rowsCount)) {
            nextElement.setAttribute("disabled", "disabled");
        }

        if (!!nextElement) {
            nextElement.onclick = () => {

                if (!this.nextElementEvent) {
                    if (this.#currentPage < (totalCount / this.rowsCount)) {
                        this.#currentPage++;
                    }

                    this.#changeInteractionButtonsPaginated(totalCount, previousElement, nextElement);

                    document.dispatchEvent(nextPageEvent);
                }
            };
        }
        else {
            console.error("Element with id 'next' does not exist.");
        }

        let changePageEvent = new CustomEvent("changePageEvent", { detail: { sender: this, page: this.#currentPage } });

        let numberElements = document.getElementsByName('numberPagination');

        numberElements.forEach(item => item.onclick = () => {
            let numberStr = item.innerText.trim();
            this.#currentPage = parseInt(numberStr);

            if (!this.nextElementEvent) {
                document.dispatchEvent(changePageEvent);
            }
        });
    }

    #changeInteractionButtonsPaginated(totalCount, previousElement, nextElement) {
        if (this.#currentPage === 1) {
            previousElement.setAttribute("disabled", "disabled");
        }
        else {
            previousElement.removeAttribute("disabled");

        }

        if (this.#currentPage >= (totalCount / this.rowsCount)) {
            nextElement.setAttribute("disabled", "disabled");
        }
        else {
            nextElement.removeAttribute("disabled");
        }

    }

    setColumns(configs) {

        if (!Array.isArray(configs)) {
            console.error('Only array are allowed.');
            return;
        }

        let headConfigsMap = configs.map(x => {
            return {
                header: x.header, classHeader: x.classHeader
            }
        });

        this.#setHeader(headConfigsMap);

        this.bodyConfigsMap = configs.map(x => {
            return {
                data: x.data,
                classBody: x.classBody,
                render: x.render
            }
        });
    }

    #setHeader(configsHeader) {

        let table = document.getElementById(this.tableId);

        let header = table.getElementsByTagName('thead')[0];

        this.setRows(1, header);

        let row;
        if (!header) {
            header = table.createTHead();
            row = header.insertRow(0);
        }
        else {
            let rows = header.rows;
            row = rows[0];
        }

        this.setCells(configsHeader.length, row);

        let i = 0;

        configsHeader.forEach(configheader => {
            var cell = table.getElementsByTagName('thead')[0].rows[0].cells[i++];
            cell.className = configheader.classHeader;
            cell.innerHTML = configheader.header;
        });
    }

    fill(totalCount, data, previousId, nextId) {
        if (!Array.isArray(data)) {
            console.error('Only array are allowed.');
            return;
        }

        let tbody = document.getElementsByClassName('table')[0].getElementsByTagName('tbody')[0];
        this.setRows(0, tbody);
        this.setRows(data.length, tbody);
        let rows = tbody.rows;

        let i = 0;
        data.forEach(item => { //rows

            this.setCells(this.bodyConfigsMap.length, rows[i]);

            var result = Object.keys(item).map((key) => [key, item[key]]);

            for (let j = 0; j < this.bodyConfigsMap.length; j++) { //cells
                let keyValuePair = result.find(y => y[0] == this.bodyConfigsMap[j].data);

                let cell = rows[i].cells[j];

                let render = this.bodyConfigsMap[j].render;
                if (!!render) {
                    cell.innerHTML = (!!result[j]) ? render(item) : render();
                }
                else {
                    cell.innerHTML = keyValuePair[1];
                }

                let classBody = this.bodyConfigsMap[j].classBody;
                if (!!classBody) {
                    cell.classList.add(classBody);
                }
            }
            i++;
        });

        let previousElement = document.getElementById(previousId);
        let nextElement = document.getElementById(nextId);

        this.#changeInteractionButtonsPaginated(totalCount, previousElement, nextElement);
    }

}
