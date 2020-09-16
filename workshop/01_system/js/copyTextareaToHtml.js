document.body.onload = () => {
    var textarea = document.createElement('textarea');
    textarea.id = 'copy';
    textarea.className = 'sys__textarea';
    textarea.innerText = textarea.value = document.querySelector('#body').innerHTML;

    document.body.appendChild(textarea);

    document.querySelector('#htmlCopyBtn').onclick = () =>{
        document.querySelector('#copy').select();
        document.execCommand('copy');
    };
};

