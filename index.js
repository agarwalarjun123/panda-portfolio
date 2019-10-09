#!/usr/bin/env node

//= =======================================================================================
/*                                                                                      *
 *                               require the node modules                               *
 *                                                                                      */
//= =======================================================================================

const fs = require('fs')

// ########################################################################################

// get the present working directory
let dir = process.cwd()

const args = process.argv[2];

(async function () {
  try {
    if (args.split('.').reverse()[0] === 'json') {
      let isHtmlFileCreated = await require('./lib/createIndexhtmlFile')(args)
      let userWantToHost = await require('./lib/askToHost')()
      console.log(userWantToHost)
      console.log('Html file generated please view it and if you would like any changes\nyou can change the content in config.json file')
    } else {
      let configContent = await require('./lib/showCLi')(args)
  
      if (configContent) {
        fs.writeFileSync(dir + '/config.json', configContent)
  
        fs.unlinkSync(dir + '/question.js')
  
        let isHtmlFileCreated = await require('./lib/createIndexhtmlFile')('config.json')
        let userWantToHost = await require('./lib/askToHost').hostOrNot()
        if(userWantToHost){
          try {
            let credentials = await require('./lib/askForGithubCreds')()
            let accessToken = await require('./lib/hostHelper').getAccessToken(credentials)
            let wasRemoteRepoCreated = await require('./lib/hostHelper').createRemoteRepo(accessToken,credentials)
            if(wasRemoteRepoCreated){
              await require('./lib/hostHelper').pushRepo(dir,credentials)
            }else{
              await require('./lib/hostHelper').deleteRepo(credentials.username,accessToken)
              throw new Error("")
            }

          } catch (error) {
            console.log(error)
            console.log("Something went wrong while creating and hosting your webpage please try again or try hosting the page manually")
            
          }
          
        }
  
        console.log('Html file generated please view it and if you would like any changes\nyou can change the content in config.json file')
      } else {
        try {
          fs.unlinkSync(dir + '/question.js')
        } catch (error) {
          // this catch block will not output anything
        }
      }
    }
  } catch (error) {
    console.log(require('./lib/returnHelpLog')())
  }
  
})()
