window.addEventListener('DOMContentLoaded', () => {

  async function addClient() {
    let modalAdd = document.querySelector('.modal-add');
    let result = checkValidateAdd(modalAdd);
    if (!result) {
      return false;
    }

    await fetch('http://localhost:3000/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: result.name,
        surname: result.surname,
        lastName: result.lastName,
        contacts: result.listOfContacts
      })
    });
    sortClients();
    modalClose();
  }

  async function changeClient(id) {
    let modalChange = document.querySelector('.modal-change');
    let result = checkValidateAdd(modalChange);
    if (!result) {
      return false;
    }


    await fetch(`http://localhost:3000/api/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: result.name,
        surname: result.surname,
        lastName: result.lastName,
        contacts: result.listOfContacts
      })
    });
    sortClients();
    modalClose();
  }

  async function deleteClient(id) {
    await fetch(`http://localhost:3000/api/clients/${id}`, {
      method: 'DELETE',
    });
    sortClients();
    modalClose();
  }


  async function sortClients(list = [], value = "id", searchTrue = false, btn = document.querySelector('.table-header-id')) {
    let container = document.querySelector('.clients-container');
    let tableHeaderItem = document.querySelectorAll('.table-header-item');
    let type;
    if (!container.className.includes('load')) {
      container.classList.add('load');
    }
    if (!list.length & !searchTrue) {
      const result = await fetch('http://localhost:3000/api/clients');
      list = await result.json();
    }
    for (let item of tableHeaderItem) {
      item.classList.remove('table-header-active');
    }
    btn.classList.add('table-header-active');
    if (btn.className.includes('sort-up') & !searchTrue) {
      btn.classList.remove('sort-up');
      btn.classList.add('sort-down');
      type = "down";
    } else if (btn.className.includes('sort-down') & !searchTrue) {
      btn.classList.remove('sort-down');
      btn.classList.add('sort-up');
      type = "up";
    } else {
      for (let item of tableHeaderItem) {
        item.classList.remove('sort-up');
        item.classList.remove('sort-down');
      }
      btn.classList.add('sort-up');
      type = "up";
    }
    list.sort((a, b) => sortAll(a, b, type, value));
    createTable(list);
    container.classList.remove('load');
  }


  function sortAll(a, b, type = "up", value = "id") {
    let first;
    let second
    switch (value) {
      case "id":
        first = a.id;
        second = b.id;
        break;
      case "name":
        first = a.surname + a.name + a.lastName;
        second = b.surname + b.name + b.lastName;
        break;
      case "create":
        first = new Date(a.createdAt);
        second = new Date(b.createdAt);
        break;
      case "change":
        first = new Date(a.updatedAt);
        second = new Date(b.updatedAt);
        break;
    }
    if (type === "up") {
      if (first > second) {
        return 1
      }
      if (first < second) {
        return -1
      }
    }
    if (type === "down") {
      if (first < second) {
        return 1
      }
      if (first > second) {
        return -1
      }
    }
    return 0;
  }

  async function searchClients(searchValue) {
    const result = await fetch(`http://localhost:3000/api/clients/?search=${searchValue}`);
    let list = await result.json();
    if (!list.length) {
      list = []
      sortClients(list, "id", true);
    } else {
      sortClients(list, "id", true);
    }
  }


  function createTable(listOfClients) {
    let tableBody = document.querySelector('#tableBody');
    clearTable();
    for (let client of listOfClients) {
      tableBody.append(createClient(client));
    }
  }

  function clearTable() {
    let lines = document.querySelectorAll('.table-list');
    for (let line of lines) {
      line.remove();
    }
  }

  function createClient(client) {
    const tableLine = document.createElement('tr');
    tableLine.classList.add('table-list');
    tableLine.append(createId(client.id));
    tableLine.append(createName(client.name, client.surname, client.lastName));
    tableLine.append(createDate(client.createdAt));
    tableLine.append(createDate(client.updatedAt));
    tableLine.append(createContacts(client.contacts));
    tableLine.append(createActions(client));
    return tableLine;
  }

  function createTd() {
    let td = document.createElement('td');
    td.classList.add('table-item');
    return td;
  }

  function createId(clientId) {
    let id = createTd();
    id.classList.add('table-id');
    id.textContent = clientId;
    return id;
  }

  function createName(clientName, clientSurname, clientLastName) {
    let name = createTd();
    name.classList.add('table-name');
    name.textContent = `${clientSurname} ${clientName} ${clientLastName}`;
    return name;
  }

  function createDate(dateOf) {
    let date = new Date(dateOf)
    let dateNew = createTd();
    let time = document.createElement('time');
    let day = date.getDate();
    if (day < 10) {
      day = "0" + day;
    }
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = "0" + month;
    }
    let year = date.getFullYear();
    let hour = date.getHours();
    if (hour < 10) {
      hour = "0" + hour;
    }
    let minute = date.getMinutes();
    if (minute < 10) {
      minute = "0" + minute;
    }
    dateNew.classList.add('table-date-create');
    dateNew.textContent = `${day}.${month}.${year} `;
    time.classList.add('table-time');
    time.textContent = `${hour}:${minute}`;
    dateNew.append(time)
    return dateNew;
  }
  function createContacts(clientContacts) {
    let contacts = createTd();
    let contactsList = document.createElement('ul');
    contacts.classList.add('table-contacts');
    contactsList.classList.add('reset-list');
    contactsList.classList.add('table-contacts-list');
    if (clientContacts.length > 5) {
      for (const contact of clientContacts) {
        contactsList.classList.add('contacts-close');
        contactsList.append(createContactItem(contact));
      }
      contactsList.append(createContactsBtnOpen(contactsList, clientContacts.length - 4));
    } else {
      for (const contact of clientContacts) {
        contactsList.append(createContactItem(contact));
      }
    }
    contacts.append(contactsList);
    return contacts;
  }

  function createContactsBtnOpen(list, num) {
    let line = document.createElement('li');
    let btn = document.createElement('button');
    line.classList.add('table-contacts-item-btn');
    btn.classList.add('table-contacts-btn');
    btn.textContent = `+${num}`;
    btn.addEventListener('click', () => {
      list.classList.remove('contacts-close');
      list.classList.add('contacts-open');
      btn.classList.add('contacts-btn-close');
    })
    line.append(btn);
    return line;
  }

  function createContactItem(contact) {
    let line = document.createElement('li');
    let link = document.createElement('div');
    line.classList.add('table-contacts-item');
    line.classList.add(contact.type);
    link.classList.add('table-contacts-link');
    link.addEventListener('click', () => {
      link.classList.add('table-contacts-link-active');
    })
    window.addEventListener('click', (e) => {
      if (e.target.classList.length) {
        if (!e.target.className.includes('table-contacts-link')) {
          link.classList.remove('table-contacts-link-active');
        }
      }
    })
    line.append(link);
    line.append(createTooltip(contact));
    return line;
  }




  function createTooltip(contact) {
    let tooltip = document.createElement('div');
    let tooltipType = document.createElement('span');
    let tooltipValue = document.createElement('span');
    tooltip.classList.add('tooltip');
    tooltipType.classList.add('tooltip-type');
    tooltipType.textContent = `${contact.type}: `;
    if (contact.type === 'tel') {
      tooltipType.textContent = "";
    }
    tooltipValue.textContent = contact.value;
    tooltip.append(tooltipType);
    tooltip.append(tooltipValue);
    return tooltip;
  }



  function createActions(client) {
    let actions = createTd();
    let btnChange = document.createElement('button');
    let btnDelete = document.createElement('button');
    actions.classList.add('table-actions');
    btnChange.classList.add('table-btn');
    btnChange.classList.add('table-btn-change');
    btnDelete.classList.add('table-btn');
    btnDelete.classList.add('table-btn-delete');
    btnChange.textContent = 'Изменить';
    btnDelete.textContent = 'Удалить';
    btnChange.addEventListener('click', () => {
      openModalChange(client.id, btnChange);
    })
    btnDelete.addEventListener('click', () => {
      openModalDelete(client.id, btnDelete);
    })
    actions.append(btnChange);
    actions.append(btnDelete);
    return actions;
  }

  // MODAL

  let modal = document.querySelector('.modal');

  function modalClose() {
    let modal = document.querySelector('.modal');
    let btnChangeList = document.querySelectorAll('.table-btn-change');
    let btnDeleteList = document.querySelectorAll('.table-btn-delete');
    let selectItemList = document.querySelectorAll('.modal-contact-item');
    let btnContactList = document.querySelectorAll('.modal-contact-add-btn');
    let modalInputList = document.querySelectorAll('.modal-input');
    let textErrorBLockList = document.querySelectorAll('.text-error');
    for (let btn of btnChangeList) {
      btn.classList.remove('table-btn-change-load');
    }
    for (let btn of btnDeleteList) {
      btn.classList.remove('table-btn-delete-load');
    }
    for (let item of selectItemList) {
      item.remove();
    }
    for (let btn of btnContactList) {
      checkNumberOfSelect(btn);
    }
    for (let input of modalInputList) {
      input.value = "";
      input.classList.remove('modal-error');
    }
    for (let block of textErrorBLockList) {
      block.innerHTML = "";
      block.parentNode.classList.remove('modal-container-error');
    }
    modal.classList.remove('modal-change-open');
    modal.classList.remove('modal-add-open');
    modal.classList.remove('modal-delete-open');
  }

  let modalBtnCLose = document.querySelectorAll('.btn-close');
  for (let btn of modalBtnCLose) {
    btn.addEventListener('click', modalClose);
  }

  document.addEventListener('click', (e) => {
    if (e.target.classList.length) {
      if (e.target.className.includes('modal-change-open') || e.target.className.includes('modal-delete-open') || e.target.className.includes('modal-add-open')) {
        modalClose();
      }
    }
  });




  // MODAL CHANGE 

  async function openModalChange(id, btn) {
    let modal = document.querySelector('.modal');
    let btnSave = document.querySelector('#btnChangeSave');
    let btnDelete = document.querySelector('#modalChangeBtnDelete');
    btn.classList.add('table-btn-change-load');
    await addDataModalChange(id);
    modal.classList.add('modal-change-open');
    btnSave.addEventListener('click', () => {
      changeClient(id);
    })
    btnDelete.addEventListener('click', () => {
      modalClose();
      openModalDelete(id, btn.nextSibling);
    })
  }

  async function addDataModalChange(id) {
    let spanId = document.querySelector('.modal-change-id');
    let inputSurname = document.querySelector('#surnameChange');
    let inputName = document.querySelector('#nameChange');
    let inputLastName = document.querySelector('#lastNameChange');
    let btn = document.querySelector('#modalChangeAddContact');
    const result = await fetch(`http://localhost:3000/api/clients/${id}`);
    const client = await result.json();
    spanId.textContent = `ID: ${client.id}`;
    inputSurname.value = client.surname;
    inputName.value = client.name;
    inputLastName.value = client.lastName;
    for (let contact of client.contacts) {
      addContact(btn, contact.type, contact.value);
    }
  }

  function activateSelects() {
    let listOfSelect = document.querySelectorAll('.modal-select');
    for (const select of listOfSelect) {
      const choices = new Choices(select, {
        searchEnabled: false,
        position: 'bottom',
        shouldSort: false,
      });
      select.addEventListener('change', () => {
        select.parentNode.parentNode.nextElementSibling.type = select.firstElementChild.value;
        clearSelectedElement();
      });
    }
  }

  function clearSelectedElement() {
    let galleryOptionList = document.querySelectorAll('.choices__item--choice');
    for (let option of galleryOptionList) {
      option.classList.add('is-open');
      if (option.classList[2] === 'is-selected') {
        option.classList.add('is-close');
      }
    }
  }

  // MODAL DELETE

  function openModalDelete(id, btn) {
    let modal = document.querySelector('.modal');
    let modalBtnDelete = document.querySelector('#modalBtnDelete');
    btn.classList.add('table-btn-delete-load');
    modal.classList.add('modal-delete-open');
    modalBtnDelete.addEventListener('click', () => {
      deleteClient(id);
    });
  }

  let modalBtnExitList = document.querySelectorAll('.modal-change-btn-exit');
  for (let btn of modalBtnExitList) {
    btn.addEventListener('click', modalClose);
  }


  // MODAL ADD

  function openModalAdd() {
    let modal = document.querySelector('.modal');
    let btnAddSave = document.querySelector('#btnAddSave');
    modal.classList.add('modal-add-open');
    btnAddSave.addEventListener('click', () => addClient());
  }

  function addContact(btn, type = 'tel', value = "") {
    let line = document.createElement('li');
    line.classList.add('modal-contact-item');
    line.innerHTML = `<select class="modal-select">
    <option ${(type === 'tel') ? 'selected="selected"' : ""} value="tel">Телефон</option>
    <option ${(type === 'email') ? 'selected="selected"' : ""} value="email">Email</option>
    <option ${(type === 'fb') ? 'selected="selected"' : ""} value="fb">Facebook</option>
    <option ${(type === 'VK') ? 'selected="selected"' : ""} value="VK">VK</option>
    <option ${(type === 'another') ? 'selected="selected"' : ""} value="another">Другое</option>
  </select>
  <input class="modal-contact-add-input" type=${(type === 'tel') ? "tel" : "text"} value="${value}" placeholder="Введите данные контакта">
  <button class="btn-input-delete" type="button"><svg width="12" height="12" viewbox="0 0 12 12"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z"
        fill="#F06A4D" />
    </svg></button>`;
    btn.previousElementSibling.append(line);
    let btnSelectDelete = line.querySelector('.btn-input-delete');
    btnSelectDelete.addEventListener('click', () => {
      line.remove();
      checkNumberOfSelect(btn);
    })
    activateSelects();
    checkNumberOfSelect(btn);

  }

  function checkNumberOfSelect(btn) {
    let selectList = btn.parentNode.querySelectorAll('.modal-contact-item');
    if (selectList.length) {
      btn.parentNode.classList.remove('modal-container-without-select');
    } else {
      btn.parentNode.classList.add('modal-container-without-select');
    }
    if (selectList.length === 10) {
      btn.classList.add('modal-btn-disable');
    } else {
      btn.classList.remove('modal-btn-disable');
    }
  }

  // VALIDATE

  function checkValidateAdd(modal) {
    let check = true;
    let textError = "";
    let textErrorBlock = modal.querySelector('.text-error');
    let inputSurname = modal.querySelector("input[name='surname']");
    let inputName = modal.querySelector("input[name='name']");
    let lastName = modal.querySelector("input[name='lastName']").value.trim();
    let listOfContacts = [];
    let contactsList = document.querySelectorAll('.modal-contact-item');
    if (inputSurname.value.trim() === "") {
      inputSurname.classList.add('modal-error');
      check = false;
      textError += "Введите фамилию<br>";
      inputSurname.addEventListener('keydown', () => {
        inputSurname.classList.remove('modal-error');
      })
    }
    if (inputName.value.trim() === "") {
      inputName.classList.add('modal-error');
      check = false;
      textError += "Введите имя<br>";
      inputName.addEventListener('keydown', () => {
        inputName.classList.remove('modal-error');
      })
    }
    for (let item of contactsList) {
      let select = item.querySelector('.modal-select')
      let input = item.querySelector('.modal-contact-add-input');
      if (input.value.trim()) {
        if (input.type === 'tel' && Number(input.value)) {
          if (input.value.includes('+') && input.value.length !== 12) {
            input.parentNode.classList.add('modal-error');
            check = false;
            textError += "Введите телефон корректно<br>";
          } else if (!input.value.includes('+') && input.value.length !== 11) {
            input.parentNode.classList.add('modal-error');
            check = false;
            textError += "Введите телефон корректно<br>";
          }
        }

        if (input.type === 'email' && !input.value.includes('@')) {
          input.parentNode.classList.add('modal-error');
          check = false;
          textError += "Введите Email корректно<br>";
        }
        listOfContacts.push({ type: select.firstChild.value, value: input.value.trim() });
      } else {
        input.parentNode.classList.add('modal-error');
        check = false;
        textError += "Поле контакта не может быть пустым<br>";
      }
      input.addEventListener('keydown', () => {
        input.parentNode.classList.remove('modal-error');
      })
    }

    let surname = inputSurname.value.trim();
    let name = inputName.value.trim();
    if (check) {
      return {
        surname,
        name,
        lastName,
        listOfContacts
      }
    } else {
      textErrorBlock.parentNode.classList.add('modal-container-error');
      textErrorBlock.innerHTML = textError;
      return check;
    }

  }


  let inputSearch = document.querySelector('.header-input');
  let timeOut;
  inputSearch.addEventListener('keyup', () => {
    window.clearTimeout(timeOut);
    timeOut = window.setTimeout(keyUp(inputSearch.value), 300);
  })

  function keyUp(value) {
    searchClients(value);
  }




  let btnSortId = document.querySelector('.table-header-id');
  let btnSortName = document.querySelector('.table-header-name');
  let btnSortCreate = document.querySelector('.table-header-date-create');
  let btnSortChange = document.querySelector('.table-header-date-change');

  btnSortId.addEventListener('click', () => sortClients());
  btnSortName.addEventListener('click', () => sortClients([], 'name', false, btnSortName));
  btnSortCreate.addEventListener('click', () => sortClients([], 'create', false, btnSortCreate));
  btnSortChange.addEventListener('click', () => sortClients([], 'change', false, btnSortChange));



  let btnAddContactList = document.querySelectorAll('.modal-contact-add-btn');
  for (let btn of btnAddContactList) {
    btn.addEventListener('click', () => addContact(btn));
  }
  let btnAddClient = document.querySelector('.btn-add');
  btnAddClient.addEventListener('click', openModalAdd);


  sortClients();
});
