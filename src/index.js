import Web3 from 'web3';
import './style.scss'
import w3 from './provider.js'
import {MCC, MCCaddr, Animal} from './provider.js'
import {checkAlive, genTable} from './anim.js'
//import './_bootswatch.scss'
//import 'bootstrap/scss/bootstrap.scss';
const BN = w3.utils.BN;
let isLoggedIn = false;
let account = null;
let bal = 0.0;
let anim = []
$(()=>{
    const update = () =>{      
        if(isLoggedIn){
            $("#status")[0].textContent="Updating..."
            console.log(account.address)
            MCC.methods.balanceOf(account.address).call().then((balance)=>{
                bal = balance;
                $("#balance")[0].textContent = (w3.utils.toBN(balance).div(w3.utils.toBN('1000000000000000000')));
            })
            MCC.methods.getAnimals(account.address).call().then((addr)=>(
                Promise.all($.map(addr, (a)=>{
                    let anim = new w3.eth.Contract(Animal, a);
                    return Promise.all([anim.methods.getName().call(), anim.methods.getDate().call(), anim.methods.getCommands().call(), anim.methods.getTimes().call(), anim.methods.getType().call(), a])
                }))
            )).then((animals)=>{
                $("#status")[0].textContent="Connected"
                anim = animals;
                $("#animcont").empty()
                $.each(animals, (i, e)=>{
                    let alive = checkAlive(e);
                    $("#animcont").append(`<div class="card text-white mb-3 mr-3 ${alive ? 'bg-primary' : 'bg-danger'}" style="max-width: 20rem; display:inline-block; vertical-align:top;" id=${'cow'+i}>
                    <div class="card-header">Cow at: ${('' + e[5]).slice(0, 8)}...</div>
                    <div class="card-body">
                      <h4 class="card-title">${e[0]}</h4>
                      <p class="card-text"><b>Bought at:</b> ${new Date(e[1] * 1000).toLocaleString()}</p>
                      <p class="card-text">Caw is ${alive? 'alive' : 'dead'}</p>
                      <button class="btn btn-primary btn-block my-1" onclick='$("${"#cow" + i+ " table"}").toggleClass("hidden")'>Show commands</button>
                      ${genTable(e)}
                      <button class="btn btn-primary btn-block my-1 ${alive ? '' :'disabled'}" onclick="feedCow(${i})">Feed</button>
                      <button class="btn btn-warning btn-block my-1 ${alive ? '' :'disabled'}" onClick="killCow(${i})">Slaugher</button>
                    </div>
                  </div>`)
                })
                
            });
        }
    }
    $(_).on("hashchange", ()=>{
        update();
    })
    const login = ()=>{
        isLoggedIn = true;
    _.target = "main"
    $("#sign_in").hide();
    $("#sign_out").show();
    $(".logreq").show();
    $(".notlog").hide();
    }
    const logout = ()=>{
        isLoggedIn = false;
    _.target = "main";
    $("#sign_in").show();
    $("#sign_out").hide();
    $(".logreq").hide();
    $(".notlog").show();
    }
    logout();
$("#keysubm").on("click", ()=>{
    account = w3.eth.accounts.privateKeyToAccount($("#privatekey")[0].value);
    login();
})
$("#sign_out").on("click", ()=>{
    account = null;
    logout();
})
$("#sendmoney").on("click", ()=>{
    $("#status")[0].textContent="Transaction processing..."
    let tx = {
        from: account.address,
        to: MCCaddr,
        //gasPrice: 2000,
        data: MCC.methods.transfer($("#toaddress")[0].value, w3.utils.toHex(w3.utils.toBN($("#amount")[0].value).mul(w3.utils.toBN("1000000000000000000"))) ).encodeABI(),
        gas: 2000000
    }
    $("#sendform").hide()
    account.signTransaction(tx).then((sgn)=>(
        w3.eth.sendSignedTransaction('' + sgn.rawTransaction)
    )).then(update);
})
_.killCow = (id)=>{
    if(!checkAlive(anim[id])){
        return;
    }
    $("#status")[0].textContent="Transaction processing..."
    let tx = {
        from: account.address,
        to: MCCaddr,
        //gasPrice: 2000,
        data: MCC.methods.sendCmd(anim[id][5], 255).encodeABI(),
        gas: 2000000
    }
    account.signTransaction(tx).then((sgn)=>(
        w3.eth.sendSignedTransaction('' + sgn.rawTransaction)
    )).then(update);
}
_.feedCow = (id)=>{
    if(!checkAlive(anim[id])){
        return;
    }
    $("#status")[0].textContent="Transaction processing..."
    let tx = {
        from: account.address,
        to: MCCaddr,
        //gasPrice: 2000,
        data: MCC.methods.sendCmd(anim[id][5], 1).encodeABI(),
        gas: 2000000
    }
    account.signTransaction(tx).then((sgn)=>(
        w3.eth.sendSignedTransaction('' + sgn.rawTransaction)
    )).then(update);
}
$("#buybtn").on('click', ()=>{
    if(balance < 20){
        return;
    }
    $("#status")[0].textContent="Transaction processing..."
    let tx = {
        from: account.address,
        to: MCCaddr,
        //gasPrice: 2000,
        data: MCC.methods.buyAnimal(0, $("#cowname")[0].value).encodeABI(),
        gas: 2000000
    }
    account.signTransaction(tx).then((sgn)=>(
        w3.eth.sendSignedTransaction('' + sgn.rawTransaction)
    )).then(update);
})
});