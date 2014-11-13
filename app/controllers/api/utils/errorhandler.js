'use strict';

module.exports = function(res){

  return function(msg,code){
    res.status(code||500).send({
      message: msg
    });
  };

};
