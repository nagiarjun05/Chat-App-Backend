const msgsend=document.getElementById("sendBtn");

const msg=document.getElementById('textmsg');

const logout=document.getElementById('logout');

const chat=document.getElementById('chat');

const userList=document.getElementById('user-list');

const groupList=document.getElementById('show-groups');

const groupDiv = document.getElementById("group");

const createGroup=document.getElementById('create-group');

const nav=document.getElementById('nav');

const navList=document.getElementById('nav-list');

const removeNav=document.querySelector('.cancel');

const User = localStorage.getItem("User");

const pages=document.querySelector('.pagination');

const groupId = localStorage.getItem("groupId");

const groupName = localStorage.getItem("groupName");

const userId=localStorage.getItem('userId');

const chatList = document.getElementById("chat");

const fileList = document.getElementById("filemsg");

const token=localStorage.getItem('token');

msgsend.addEventListener('click', (e)=>{
    e.preventDefault();
    const msgToSend=msg.value
    if (!msgToSend){
        alert("You should enter some message before sending.")
    }
    axios({
        method:'post',
        url:`http://localhost:3000/users/msg`,
        data:{
            msg: msgToSend,
            groupId: groupId
        },
        headers:{'Authorization':token}
    })
    .then((res)=>{
        alert(res.data.message)
        showMessages()
    })
    .catch((err)=>{
        showError(err.data)
    })
});

logout.addEventListener('onclick',(e)=>{
    console.log(logout)
    localStorage.removeItem('token');
    window.location.href='/login.html'
});

document.querySelector('body').addEventListener('click',(e)=>{
  if(e.target.className=='groupName'){
    localStorage.setItem("groupName",e.target.innerHTML);
    localStorage.setItem("groupId",e.target.getAttribute('value'));
    const page=1;
    showMessages(page)
  }
});

groupList.addEventListener('click',(e)=>{
  e.preventDefault()
  navList.innerHTML='';
  axios({
    method:'get',
    url:`http://localhost:3000/users/groups`,
    headers:{'Authorization':token}
  })
  .then((res)=>{
    nav.classList.toggle('active');
    res.data.groups.forEach((group)=>{
      const li=document.createElement('li');
      li.classList='group-item'
      li.innerHTML=`
      <a href="#" class="groupName" value="${group.id}">${group.name}</a>
      `
      navList.appendChild(li);          
    })
  })
  .catch((err)=>{
      console.log(err.message)
  })
});

createGroup.addEventListener('click',()=>{
    window.location.href='/creategroup.html';
});

removeNav.addEventListener('click', (e)=>{
    e.preventDefault();
    nav.classList.remove('active');
});

window.addEventListener('load', ()=>{
  const page=1;
  showMessages(page)
  // setInterval(()=>{
  //     const page=1;
  //     showMessages(page)
  // },1000)
});

document.querySelector('body').addEventListener('click',async (e)=>{
  if(e.target.className=='groupName'){
    localStorage.setItem("groupName",e.target.innerHTML);
    localStorage.setItem("groupId",e.target.getAttribute('value'));
    window.location.href='/chat.html';
  }
});

const showMessages=function (page){
    document.getElementById("groupname").innerHTML = `${groupName} Group`;
    document.getElementById("username").innerHTML = `<small class="grp-user">Hey! </small> ${User}`;
    isAdmin()
    getUsers()
    getFiles()
    axios({
        method:'get',
        url: `http://localhost:3000/users/getmsgs?groupId=${groupId}&groupName=${groupName}&page=${page}`,
        headers:{'Authorization':token}
    })
    .then(res=>{
      chatList.innerHTML='';
      res.data.messageUser.forEach(element => {
          if (userId == element.userId) {
              let child = `<li class="me" id=${element.id}>
              <div class="entete">
                <h3>${new Date(Date.parse(element.createdAt)).toLocaleString([], {
                timezone: "IST",
                hour12: true,
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              </h3>
                <h2>You</h2>
              </div>
              <div class="message">
                ${element.message}
              </div>
            </li>`;
            chatList.innerHTML += child;
            } else {
              let child = `<li class="you" id=${element.id}>
              <div class="entete">
                <h3>${new Date(Date.parse(element.createdAt)).toLocaleString([], {
                timezone: "IST",
                hour12: true,
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              </h3>
                <h2>${element.user.name}</h2>
              </div>
              <div class="message">
                ${element.message}
              </div>
            </li>`;
            chatList.innerHTML += child;
            }
        pagination(res.data.currentPage,res.data.hasNextPage,res.data.nextPage,res.data.hasPreviousPage,res.data.previousPage)  
      });
    }).catch(err=>showError(err));
};

function pagination(currentPage,hasNextPage,nextPage,hasPreviousPage,previousPage){
  pages.innerHTML='';
  if (hasPreviousPage){
      const prevBtn=document.createElement('button')
      prevBtn.innerHTML=previousPage;
      pages.appendChild(prevBtn);
      prevBtn.addEventListener('click',()=>{
          showMessages(previousPage)
          });
  }

  const curBtn=document.createElement('button')
  curBtn.innerHTML=currentPage;
  pages.appendChild(curBtn);
  curBtn.addEventListener('click',()=>{
    showMessages(currentPage)
      });
  

  if (hasNextPage){
      const nexBtn=document.createElement('button')
      nexBtn.innerHTML=nextPage;
      pages.appendChild(nexBtn);
      nexBtn.addEventListener('click',()=>{
        showMessages(nextPage)
          });
  }
};

async function isAdmin() {
    try {
      let response = await axios.get(`http://localhost:3000/users/isAdmin?groupId=${groupId}`, { headers: { "Authorization": token } });
      localStorage.setItem('isAdmin', response.data);
      if (JSON.parse(localStorage.getItem('isAdmin'))) {
        document.getElementById('add-user').classList.add('admin');
      }
    } catch (error) {
      console.log(error);
    };
};

async function showFileOnScreen(data) {
  localStorage.setItem(`file${groupId}`, JSON.stringify(data));
  fileList.innerHTML='';
  data.forEach((data) => {
    let names = data.fileName
    let createdAt = (((names.split("/")[1]).split('.')[0]).split(' ').slice(1, 5)).join(' ')
    if (User == data.name) {
      let child = `<li class="me" id=${data.userId}>
      <div class="">
      <h2>You</h2>
        <h5>${new Date(Date.parse(createdAt)).toLocaleString([], {
        timezone: "IST",
        hour12: true,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
      </h5>
      </div>
      <div class="message">
      <a href="${data.fileUrl || data.message}">Link!</a>
      </div>
    </li>
    <hr>`;

      fileList.innerHTML += child;
    } else {
      let child = `<li class="you" id=${data.userId}>
      <h2 class="text-primary">${data.name}</h2>
      </div>
      <div class="triangle"></div>
      <div class="message">
      <a href="${data.fileUrl || data.message}">Link!</a>
      </div>
    </li>
    <hr>`;

      fileList.innerHTML += child;
    }
  });
};


async function getFiles() {
  const files = localStorage.getItem(`file${groupId}`);
  let response = await axios.get(`http://localhost:3000/users/getfile?groupId=${groupId}`, { headers: { "Authorization": token } });
  let data = response.data.urls;
  setTimeout(() => {
    showFileOnScreen(data)
  }, 500);
};


async function getUsers() {
    try {
      let response = await axios.get(
        `http://localhost:3000/users/getusers?groupId=${groupId}`,
        { headers: { "Authorization": token } }
      );
      let admin = JSON.parse(localStorage.getItem('isAdmin'));
      if (admin) {
        groupDiv.innerHTML='';
        response.data.forEach((data) => displayGroupAdminUser(data));
      } else {
        groupDiv.innerHTML='';
        response.data.forEach(data => displayNormalUsers(data));
      };
    } 
    catch (error) {
      console.log(error);
    }
};

function displayGroupAdminUser(data) {
    let child = `<div  class="group-style" id=${data.id}>
    <div class="user-btn">${data.name}</div>
    <div class="admin-buttons">
    <a href="http://127.0.0.1:5500/views/chat/chat.html" class="add-user mx-2 btn btn-sm btn-secondary rounded-5" onclick="makeAdmin('${data.id}'); window.location.reload(true); return false;" data-toggle="tooltip" title="Add Admin">&#9889</a>
    <a class="remove-admin btn btn-sm btn-secondary rounded-5 mx-2" onclick="removeAdmin('${data.id}')" data-toggle="tooltip" title="Remove Admin">&#9940</a>
    <a class="remove-user btn btn-sm btn-secondary rounded-5 mx-2" onclick="removeUser('${data.id}')" data-toggle="tooltip" title="Remove User">&#128683</a>
    </div> 
  </div>
  <hr/>`;
  
    groupDiv.innerHTML += child;
};
  
function displayNormalUsers(data) {
    let child = `<div style="width:100%;color:white" class="group-style" id=${data.id}>
    <button class="user-btn">${data.name}</button>
    <div class="admin-buttons">
    <a class="remove-user btn btn-sm btn-secondary rounded-5" onclick="removeUser('${data.id}')" data-toggle="tooltip" title="Remove User">&#128683</a>
    </div>
  </div>
  <br/>
  <hr style="color:white;"/>`
  
    groupDiv.innerHTML += child;
};
  
async function removeUser(userId) {
    const details = {
      userId,
      groupId
    };
    try {
      let response = await axios.post('http://localhost:3000/users/remove-user', details, { headers: { "Authorization": token } });
      alert('User removed Successfully!');
      removeUserFromScreen(response.data.user);
    } catch (error) {
      if (error.response.status == 402) {
        alert('Only Admin has delete rights!');
      } else if (error.response.status == 404) {
        alert('no group or user found!');
      } else {
        alert('unknown error occured! Cannot change admin rights.');
        };
    };
};
  
function removeUserFromScreen(user) {
    const child = document.getElementById(`${user.id}`);
    groupDiv.removeChild(child);
}
  
async function makeAdmin(userId) {
    const details = {
      userId,
      groupId
    };
    console.log(details)
    try {
      let response = await axios.post(`http://localhost:3000/users/makeAdmin`, details, { headers: { "Authorization": token } });
      alert('User is Admin now!');
    } catch (error) {
      console.log(error, { message: 'unknown error occurred! Cannot change admin rights.' });
    }
}
  
async function removeAdmin(userId) {
    const details = {
      userId,
      groupId
    };
    try {
      let response = await axios.post('http://localhost:3000/users/removeAdmin', details, { headers: { "Authorization": token } });
      alert('Removed Admin rights from User!');
    } catch (error) {
      console.log(error, { message: 'Cannot make admin! Error occurred' });
    }
}

document.getElementById('form-group').onsubmit = async function (e) {
    e.preventDefault();
    const details = {
      email: e.target.email.value,
      groupId: groupId
    };
    try {
      let response = await axios.post('http://localhost:3000/users/addUser', details, { headers: { "Authorization": token } });
      displayGroupAdminUser(response.data.user);
      alert('User added to group successfully!');
      document.querySelector('.groupName').value = '';
    } catch (error) {
      if (error.response.status == 401) {
        alert("User already in group!");
      } else if (error.response.status == 400) {
        alert("Enter Mail!");
      } else if (error.response.status == 404) {
        alert("User not found!")
      } else {
        alert('Unknown error occurred!');
        };
    };
};

const fileform = document.getElementById('uploadForm')
fileform.addEventListener('submit', async function (e) {
  e.preventDefault();
  let formData = new FormData(fileform)
  let response = await axios.post(`http://localhost:3000/users/postfile?groupId=${groupId}`, formData, { headers: { "Authorization": token, "Content-Type": "multipart/form-data" } });
  let data = response.data
  console.log(data)
  let chatData = []
  chatData.push(data)
  showFileOnScreen(chatData);
  alert('File uploaded and sent successfully!')
})

const modal = document.getElementById("modal");
const openModalButton = document.getElementById("open-modal-button");
const closeModalButton = document.getElementById("close-modal-button");

openModalButton.addEventListener("click", function () {
  modal.classList.add("show");
});

closeModalButton.addEventListener("click", function () {
  modal.classList.remove("show");
});

function showError(err){
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
};