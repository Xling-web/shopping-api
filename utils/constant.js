const db = require('../db/index')

exports.useSql = (sql,info)=>{
    return new Promise((resolve, reject) => {
        db.query(sql,info,(err,result)=>{
            if(err)return resolve(err instanceof Error ? err.message : err);
            if((result && result.length >= 0) || result.affectedRows >= 1){
                resolve(result);
            }else{
                resolve();
            }
        })
    })
}