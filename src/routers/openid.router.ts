import { Router } from "express";

import { config } from '../../config'

const openidRouter = Router();

// TODO credential static configuration
const credentials = [
  {
    credentialConfiguration: {
      'CredentialSdJwt': {
        'scope': 'CredentialSdJwt',
        'cryptographic_binding_methods_supported': ['ES256'],
        'credential_signing_alg_values_supported': ['ES256'],
        'proof_types_supported': {
          'proof_signing_alg_values_supported': ['ES256']
        },
        'format': 'vc+sd-jwt',
        'vct': 'urn:wwwallet:test',
        'credential_definition': {
          'credentialSubject': {
            'username': [ { 'name': 'Username' } ]
          },
          'type': [
            'VerifiableCredential',
            'CredentialSdJwt'
          ]
        }
      }
    },
    display: {
      'background_color': '#ffd758',
      'locale': 'en-US',
      'name': 'Username (SD JWT)',
      'text_color': '#333333'
    }
  }
]

const serverConfiguration = {
	'issuer': config.url,
	'authorization_endpoint': config.url + '/auth/authorize',
	'token_endpoint': config.url + '/auth/token',
	'pushed_authorization_request_endpoint': config.url + '/auth/pushed_authorization_request',
	'response_types_supported': ['authorization_code']
}

const credentialIssuerConfiguration = {
	'credential_issuer': config.url,
	'credential_endpoint': config.url + '/openid/credential',
	'authorization_servers': [
    config.url
  ],
  'display': credentials.map(({ display }) => display),
  'credential_configurations_supported': credentials.map(({ credentialConfiguration }) => credentialConfiguration)
}

openidRouter.get('/oauth-authorization-server', async (req, res) => {
  res.send(serverConfiguration)
})

openidRouter.get('/openid-configuration', async (req, res) => {
  res.send(serverConfiguration)
})

openidRouter.get('/openid-credential-issuer', async (req, res) => {
  res.send(credentialIssuerConfiguration)
})

export {
  openidRouter
}
