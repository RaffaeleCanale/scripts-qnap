const request = require('request');
const parseString = require('xml2js').parseString;

const encoder = require('./qnap_encode_password')

const webAddress = process.argv[2]
const username = process.argv[3]
const encode_string = encoder.ezEncode(encoder.utf16to8(process.argv[4]))

const url=`http://${webAddress}:8080/cgi-bin/authLogin.cgi?user=${username}&pwd=${encode_string}`


// console.log(url);

request(url, (err, res, body) => {
    if (err) return error(err);
    if (res.statusCode !== 200) return error('Request failed', res.statusCode);

    const parsed = parseString(body, (err, result) => {
        if (err) return error('Failed to parse response', err);

        const authResult = result.QDocRoot.authPassed[0]

        if (authResult !== '1') return error('Auth failed');

        const authSid = result.QDocRoot.authSid[0]
        console.log(authSid);
        process.exit(0)
    })
})


function error() {
    console.error(arguments);
    console.error('Auth url: ', url);
    process.exit(1)
}
