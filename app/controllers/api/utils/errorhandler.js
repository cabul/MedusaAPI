'use strict';

var handle = function(err){

  switch(err.name) {
    case 'CastError': return {
      msg: 'One of the ids was invalid',
      code : 400
    };
    default: return {
      msg  : 'Internal Server Error ('+err.name+'): '+err.message+'\nPlease contact server administrators',
      code : 500
    };
  }

};


module.exports = function(res){

  return function(msg,code){

    if(!code) {
      var error = handle(msg);
      msg  = error.msg;
      code = error.code;
    }

    res.status(code||500).send({
      message: msg
    });
  };

};
