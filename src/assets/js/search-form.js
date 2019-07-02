document.addEventListener('DOMContentLoaded', () => {

  // Define variables
  const searchInput = document.querySelector('.js-form-input'),
    clearInputBtn = document.querySelector('.js-form-input-clear'),
    searchHistoryList = document.querySelector('.js-history-list'),
    clearHistoryBtn = document.querySelector('.js-clear-history'),
    resultsList = document.querySelector('.js-form-results'),
    historyList = document.querySelector('.js-history-list');

  let deleteButtons = document.querySelectorAll('.js-delete-tool'),
    localStorage = window.localStorage;


  // Initial history load
  try {
    updateHistoryList();
  } catch (e) {
    console.log(e.message);
  }


  // Event listener for every delete button
  function addClickEventListenerToDeleteToolButton() {
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const listItem = button.parentElement,
          toolName = listItem.querySelector(".js-tool").innerText,
          toolStorage = getToolsFromLocalStorage();

        if (Object.keys(toolStorage).includes(toolName)) {
          delete toolStorage[toolName];
          localStorage.setItem("tools", JSON.stringify(toolStorage));
          searchHistoryList.removeChild(listItem);
        }
      });
    })
  }


  // History load
  function updateHistoryList() {
    removeListChildren(historyList);

    Object.values(getToolsFromLocalStorage()).forEach(tool => {
      historyList.appendChild(createHistoryListItem(tool));
    });

    deleteButtons = document.querySelectorAll('.js-delete-tool');
    addClickEventListenerToDeleteToolButton();
  }


  // Create history list item
  function createHistoryListItem(_tool) {
    const item = document.createElement('li');
    item.className = 'm-search__history-list-item';
    item.setAttribute('aria-label', 'Tool information');

    const toolName = document.createElement('span');
    toolName.innerText = _tool.title;
    toolName.className = 'm-search__history-tool-title js-tool';

    const time = document.createElement('span');
    time.innerText = _tool.date;
    time.className = 'm-search__history-time';

    const button = document.createElement('button');
    button.className = 'a-btn a-btn--delete js-delete-tool';
    button.innerHTML = "&#x2715;";

    item.appendChild(toolName);
    item.appendChild(time);
    item.appendChild(button);

    return item;
  }


  // Get tools from local storage
  function getToolsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('tools'));
  }


  // Save to local storage
  function saveToLocalStorage(_text) {
    let toolsObject = localStorage.getItem('tools') != null
      ? JSON.parse(localStorage.getItem('tools'))
      : {};

    // Better way would be with moment.js
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    month = ("0" + month).slice(-2);
    let day = date.getDay();
    day = ("0" + day).slice(-2);
    let hours = date.getHours();
    hours = ("0" + hours).slice(-2);
    let minutes = date.getMinutes();
    minutes = ("0" + minutes).slice(-2);
    let ampm = (hours < 12) ? 'AM' : 'PM';

    toolsObject[_text] = {
      title: _text,
      date: year + '-' + month + '-' + day + ', ' + hours + ':' + minutes + ' ' + ampm
    };

    localStorage.setItem('tools', JSON.stringify(toolsObject));
  }


  // Create dropdown list
  function createFormDropdown(_filteredData) {
    resultsList.classList.add('m-search__results--active');
    removeListChildren(resultsList);
    if(_filteredData.length > 0) {
      _filteredData.forEach(elem => {
        resultsList.appendChild(createFormDropdownItem('m-search__results-item js-result-item', elem.title));
      });

      const resultItems = document.querySelectorAll('.js-result-item');
      resultItems.forEach(item => {
        item.addEventListener('click', () => {
          searchInput.value = item.innerText;
          saveToLocalStorage(item.innerText);
          updateHistoryList();
        });
        item.addEventListener('keydown', event => {
          if (event.keyCode === 13) {
            searchInput.value = item.innerText;
            saveToLocalStorage(item.innerText);
            updateHistoryList();
          }
        })
      })

    } else {
      resultsList.appendChild(createFormDropdownItem('m-search__results-item', 'There is no results for entered keyword'));
    }
  }


  // Create dropdown list item
  function createFormDropdownItem(_class, _text) {
    const item = document.createElement('li'),
      itemTitle = document.createTextNode(_text);

    item.className = _class;
    item.setAttribute('tabindex', '0');
    item.appendChild(itemTitle);

    return item;
  }


  // Remove list element
  function removeListChildren(_element) {
    while (_element.firstChild) {
      _element.removeChild(_element.firstChild);
    }
  }


  // Event listeners
  searchInput.addEventListener('input', event => {
    const value = event.target.value;

    if(value && value.trim().length > 0) {
      fetch('http://my-json-server.typicode.com/hmatijev/json-server/tools')
        .then(response => {
          return response.ok
            ? response.json()
            : Promise.reject('API Error');
        })
        .then(data => {
          let dataFiltered = data.filter(item => item.title.startsWith(value));
          createFormDropdown(dataFiltered);
        })
        .catch(error => console.log('Error:', error))
    } else {
      resultsList.classList.remove('m-search__results--active');
    }
  });


  clearInputBtn.addEventListener('click', () => {
    searchInput.value = '';
    removeListChildren(resultsList);
    resultsList.classList.remove('m-search__results--active');
  });


  clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('tools');
    removeListChildren(searchHistoryList);
  });

});

