const userEmail=document.getElementById("user-email");
const passWord=document.getElementById("password");
const login=document.getElementById("login");
// const forgetPassword=document.getElementById("forgetpassword");
// const axios=require('axios');

// console.log(axios);
login.addEventListener('click',(e)=>{
    e.preventDefault();
    const  email=userEmail.value;
    const  password=passWord.value;
    console.log(email)
    
    if (!email||!password){
        alert("All fields are mandatory!")
    }

    axios({
        method:'post',
        url:`http://localhost:3000/users/login`,
        data:{
            email: email,
            password: password
        }
    })
    .then((res)=>{
        // console.log(res.data.token)
        alert(res.data.message)
        localStorage.setItem('token', res.data.token)
        window.location.href="/home.html"
    })
    .catch((err)=>{
        showError(err.data)
        // console.log(err.data)
    })
});


// forgetPassword.addEventListener('click',(e)=>{
//     e.preventDefault()
//     window.location.href="/forgetPassword.html"
// });


function showError(err){
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
};
