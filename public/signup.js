const userName=document.getElementById("user-name");
const userEmail=document.getElementById("user-email");
const passWord=document.getElementById("password");
const signup=document.getElementById("signup");

signup.addEventListener('click',(e)=>{
    if (!userName.value||!userEmail.value||!passWord.value){
        alert("All fields are mandatory!")
    }
    e.preventDefault();
    const  name=userName.value;
    const  email=userEmail.value;
    const  password=passWord.value;
    axios({
            method:'post',
            url:`http://localhost:3000/users/signup`,
            data:{
                name: name,
                email: email,
                password: password
                }
            }
        )
        .then(res=>{
            alert(res.data.message);
            window.location.href="/login.html"
        })
        .catch((err)=>showError(err));
});

function showError(err){
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
};