const create=document.getElementById('submit');

const groupname=document.getElementById('group-name');

const groupList=document.getElementById('show-groups');

const nav=document.getElementById('nav');

const navList=document.getElementById('nav-list');

const removeNav=document.querySelector('.cancel');

const logout=document.getElementById('logout');

const token=localStorage.getItem('token');

create.addEventListener('click',(e)=>{
    e.preventDefault()
    axios({
        method:'post',
        url:`http://15.206.54.199:3000/users/creategroup`,
        data:{
            name: groupname.value
        },
        headers:{'Authorization':token}
    })
    .then((res)=>{
        console.log(res);
        window.location.href="/chat.html"
    })
    .catch((err)=>{
        showError(err.data)
    })
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
            <a href="/chat.html" value="${group.name}">${group.name}</a>
            `
            navList.appendChild(li);          
        })
    })
    .catch((err)=>{
        console.log(err.message)
    })
});

removeNav.addEventListener('click', (e)=>{
    e.preventDefault();
    nav.classList.remove('active');
})

logout.addEventListener('click',(e)=>{
    localStorage.removeItem('token');
    window.location.href='/login.html'
})

function showError(err){
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
};