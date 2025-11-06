(function(){
    function i(){
        return(localStorage.getItem('loggedIn')==='true')
        ||!!localStorage.getItem('userLogged')
        ||!!localStorage.getItem('authToken');
    }
    function a(){
        var l=document.getElementById('openLogin');
        var o=document.getElementById('logoutBtn');
        var g=i();if(l)l.style.display=g?'none':'';
        if(o)o.style.display=g?'':'';
    }
    document.addEventListener('DOMContentLoaded',a);
    }
)();