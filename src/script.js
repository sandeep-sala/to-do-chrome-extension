var to_do_list = [];

function sync_data() {
    chrome.storage.sync.get("to_do_list", data=>{
        to_do_list = data.to_do_list || to_do_list;
        renderTaskList(to_do_list)
    });
}

function update_sync_data() {
    chrome.storage.sync.set({
        "to_do_list": to_do_list
    });
}

chrome.runtime.onMessage.addListener(data=>{
    if (data.type === "to_do_list") {
        renderTaskList(data.list)
    }
});

function renderTaskList(list) {
    list = list || [];
    clearAllTask();
    list.forEach(function(obj) {
        task_sec.innerHTML += cardElements(obj);
    });
    add_create_delete_event_listner();
}

function header() {
    const dateHeader = document.getElementById("date");
    dateHeader.innerHTML = new Date().toGMTString().slice(0, -4);
}

function deleteTask(el) {
    let task_card = el.target.parentElement;
    let id = task_card.getAttribute("taskid");
    task_card.remove();
    let to_do_list_copy = [...to_do_list];
    to_do_list.forEach(obj=>{
        if (obj.id == id) {
            removeByAttr(to_do_list_copy, 'id', obj.id);
        }
    });
    to_do_list = [...to_do_list_copy];
    update_sync_data();
}

function generateId(n) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < n; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function removeByAttr(arr, attr, value) {
    var i = arr.length;
    while (i--) {
        if (arr[i] && arr[i].hasOwnProperty(attr) && (arguments.length > 2 && arr[i][attr] === value)) {
            arr.splice(i, 1);
        }
    }
    return arr;
}

function finishTask(el) {
    let task_card = el.target.parentElement;
    let id = task_card.getAttribute("taskid");
    task_card.classList.toggle("to-do-content-finish");
    task_card.firstElementChild.classList.toggle("to-do-content-card-checkbox-complete");
    if (task_card.firstElementChild.classList.contains("to-do-content-card-checkbox-complete")) {
        task_card.firstElementChild.innerHTML = "&#10003;";
    } else {
        task_card.firstElementChild.innerHTML = "";
    }
    to_do_list.forEach(obj=>{
        if (obj.id == id) {
            obj.complete = true;
        }
    });
    update_sync_data();
}

function cardElements(obj) {
    return `
    <div taskId="${obj.id}" class="to-do-content-cards ${obj.complete ? "to-do-content-finish" : ""}">
        <button class="to-do-content-card-checkbox ${obj.complete ? "to-do-content-card-checkbox-complete" : ""}">${obj.complete ? "&#10003;" : ""}</button>
        <div class="to-do-content-cards-info">
          <h3 class="to-do-content-card-task">${obj.title}</h3>
          <p class="time">${obj.time}</p>
        </div>
        <button class="to-do-content-card-delete-btn">&#10060;</button>
      </div>
  `;
}

function createTask() {
    let el = document.querySelector(".to-do-input")
    let task_sec = document.querySelector(".to-do-content");
    let title = el.value;
    let id = generateId(15);
    let time = new Date().toGMTString().slice(0, -4);
    to_do_list.push({
        id: id,
        title: title,
        time: time,
        complete: false
    });
    update_sync_data();
    el.value = "";
}

function clearAllTask(formData=false) {
    if (formData) {
        chrome.storage.sync.clear();
        to_do_list = [];
        update_sync_data();
    }
    task_sec = document.querySelector(".to-do-content");
    task_sec.innerHTML = "";
}

function add_create_delete_event_listner() {
    try {
        let btn_list = document.querySelectorAll(".to-do-content-card-delete-btn");
        btn_list.forEach(btn=>{
            btn.addEventListener("click", deleteTask);
        });
    } catch (error) {
        console.log(error);
    }

    try {
        let btn_list = document.querySelectorAll(".to-do-content-card-checkbox");
        btn_list.forEach(btn=>{
            btn.addEventListener("click", finishTask);
        });
    } catch (error) {
        console.log(error);
    }
}

window.onload = ()=>{
    sync_data();
    try {
        document.querySelector(".to-do-input-submit").onclick = ()=>createTask();
        document.querySelector(".to-do-input").onkeypress = ()=>event.keyCode === 13 ? createTask() : null;
    } catch (error) {
        console.log(error);
    }

    try {
        const dateHeader = document.querySelector(".to-do-header-date");
        dateHeader.innerHTML = new Date().toGMTString().slice(0, -13);
    } catch (error) {
        console.log(error);
    }

    try {
        document.querySelector(".to-do-header-refresh").addEventListener("click", function() {
            location.reload();
        });
    } catch (error) {
        console.log(error);
    }

    try {
        document.querySelector(".to-do-header-delete").addEventListener("click", function() {
            clearAllTask(true);
        });
    } catch (error) {
        console.log(error);
    }

}
