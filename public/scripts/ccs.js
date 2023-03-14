let ccs = document.getElementById('ccs');

let createCcForm = document.getElementById('create-cc-form');
let ccNameField = document.getElementById('cc-name-field');

function addCC(cc) {
    let ccDiv = document.createElement('div');
    ccDiv.className = 'cc';

    let ccName = document.createElement('h3');
    ccName.className = 'cc-name';
    ccName.innerText = cc.name;

    let ccBtn = document.createElement('button');
    ccBtn.className = 'cc-btn';
    ccBtn.innerText = 'Join!';
    ccBtn.dataset.ccName = cc.name;
    ccBtn.addEventListener('click', e => {
        window.location.replace('/community/centers/cc/' + ccBtn.dataset.ccName);
    });

    let ccRemoveBtn = document.createElement('button');
    ccRemoveBtn.className = 'cc-rm-btn';
    ccRemoveBtn.innerText = 'Remove';
    ccRemoveBtn.dataset.ccName = cc.name;
    ccRemoveBtn.addEventListener('click', async e => {
        await fetch('/community/centers/data/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cc_name: ccRemoveBtn.dataset.ccName
            })
        });
        window.location.reload();
    });

    ccDiv.appendChild(ccName);
    ccDiv.appendChild(ccBtn);
    ccDiv.appendChild(ccRemoveBtn);

    ccs.appendChild(ccDiv);
}

document.addEventListener('DOMContentLoaded', async e => {
    let ccReq = await fetch('/community/centers/data/get', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let ccResp = await ccReq.json();

    ccResp.forEach(cc => {
        addCC(cc);
    });
});

createCcForm.addEventListener('submit', async e => {
    e.preventDefault();

    await fetch('/community/centers/new/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cc_name: '' + ccNameField.value
        })
    });

    window.location.reload();

})