const checkAlive = (anim) =>{
    let cr = anim[1]*1;
    for(let i = 0; i < anim[2].length; i++){
        if(anim[2][i]*1 == 1 && anim[3][i]*1 - cr > 86400){
            return false;
        }
        if(anim[2][i]*1 == 1){
            cr = anim[3][i]*1;
        }
        else if(anim[2][i]*1 == 255){
            return false;
            //Mamma
            //I've killed the cow
        }
    }
    if((Date.now() / 1000) - cr > 86400){
        return false;
    }
    return true;
}
const genTable = (anim)=>{

   let content = ''
   for(let i = 0; i < anim[2].length; i++){
       content += `
      <tr>
          <th scope="row">${i}</th>
          <td>${anim[2][i]*1 == 255? 'slaugher' : 'feed'}</td>
          <td>${new Date(anim[3][i] * 1000).toLocaleString()}</td>
      </tr>
       `
   }

    return (`<table class="table table-hover hidden">
    <thead>
    <tr>
      <th scope="col">Id</th>
      <th scope="col">Type</th>
      <th scope="col">Date</th>
    </tr>
    </thead>
   <tbody>
   ${content}
    </tbody>
    </table>`);
}
export {checkAlive, genTable}