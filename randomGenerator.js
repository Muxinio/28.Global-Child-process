
process.on('message', (data) => {
    let randomNumbers = {};
    for (let i = 0; i < data.cant; i++) {
      let randomNumber = Math.floor(Math.random() * 1000) + 1;
      if(randomNumbers[randomNumber]){
        randomNumbers[randomNumber]++;
      }else{
        randomNumbers[randomNumber]=1;
      }
    }
    process.send(randomNumbers);
  });