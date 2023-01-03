const logout=document.getElementById('logout');

const groupList=document.getElementById('show-groups');

const createGroup=document.getElementById('create-group');

const nav=document.getElementById('nav');

const navList=document.getElementById('nav-list');

const removeNav=document.querySelector('.cancel');

const token=localStorage.getItem('token');

const parent_element=document.querySelector('body');

logout.addEventListener('click',(e)=>{
    localStorage.removeItem('token');
    window.location.href='/login.html'
});

groupList.addEventListener('click',(e)=>{
    e.preventDefault()
    navList.innerHTML='';
    axios({
        method:'get',
        url:`http://15.206.54.199:3000/users/groups`,
        headers:{'Authorization':token}
    })
    .then((res)=>{
        nav.classList.toggle('active');
        res.data.groups.forEach((group)=>{
            const li=document.createElement('li');
            li.classList='group-item'
            li.innerHTML=`
            <a class="groups" value="${group.name}">${group.name}</a>
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

parent_element.addEventListener('click',(e)=>{
    e.preventDefault(e)
    // console.log(e.target);
    if(e.target.className==='groups'){
        window.location.href=`/chat.html?group=${e.target.parentNode.children[0].innerHTML}`
    }
});


removeNav.addEventListener('click', (e)=>{
    e.preventDefault();
    nav.classList.remove('active');
});

function showError(err){
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
};