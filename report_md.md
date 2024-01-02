# ZAP Scanning Report


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 0 |
| Low | 2 |
| Informational | 6 |




## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| Cookie with SameSite Attribute None | Low | 3 |
| Strict-Transport-Security Header Not Set | Low | 3 |
| Non-Storable Content | Informational | 3 |
| Sec-Fetch-Dest Header is Missing | Informational | 3 |
| Sec-Fetch-Mode Header is Missing | Informational | 3 |
| Sec-Fetch-Site Header is Missing | Informational | 3 |
| Sec-Fetch-User Header is Missing | Informational | 3 |
| Session Management Response Identified | Informational | 3 |




## Alert Detail



### [ Cookie with SameSite Attribute None ](https://www.zaproxy.org/docs/alerts/10054/)



##### Low (Medium)

### Description

A cookie has been set with its SameSite attribute set to "none", which means that the cookie can be sent as a result of a 'cross-site' request. The SameSite attribute is an effective counter measure to cross-site request forgery, cross-site script inclusion, and timing attacks.

* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/
  * Method: `GET`
  * Parameter: `9e815ea4eebc0b344dc0a7bbd4154bc5`
  * Attack: ``
  * Evidence: `set-cookie: 9e815ea4eebc0b344dc0a7bbd4154bc5`
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/robots.txt
  * Method: `GET`
  * Parameter: `9e815ea4eebc0b344dc0a7bbd4154bc5`
  * Attack: ``
  * Evidence: `set-cookie: 9e815ea4eebc0b344dc0a7bbd4154bc5`
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/sitemap.xml
  * Method: `GET`
  * Parameter: `9e815ea4eebc0b344dc0a7bbd4154bc5`
  * Attack: ``
  * Evidence: `set-cookie: 9e815ea4eebc0b344dc0a7bbd4154bc5`
  * Other Info: ``

Instances: 3

### Solution

Ensure that the SameSite attribute is set to either 'lax' or ideally 'strict' for all cookies.

### Reference


* [ https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site ](https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site)


#### CWE Id: [ 1275 ](https://cwe.mitre.org/data/definitions/1275.html)


#### WASC Id: 13

#### Source ID: 3

### [ Strict-Transport-Security Header Not Set ](https://www.zaproxy.org/docs/alerts/10035/)



##### Low (High)

### Description

HTTP Strict Transport Security (HSTS) is a web security policy mechanism whereby a web server declares that complying user agents (such as a web browser) are to interact with it using only secure HTTPS connections (i.e. HTTP layered over TLS/SSL). HSTS is an IETF standards track protocol and is specified in RFC 6797.

* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/robots.txt
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/sitemap.xml
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: 3

### Solution

Ensure that your web server, application server, load balancer, etc. is configured to enforce Strict-Transport-Security.

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html ](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html)
* [ https://owasp.org/www-community/Security_Headers ](https://owasp.org/www-community/Security_Headers)
* [ http://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security ](http://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security)
* [ http://caniuse.com/stricttransportsecurity ](http://caniuse.com/stricttransportsecurity)
* [ http://tools.ietf.org/html/rfc6797 ](http://tools.ietf.org/html/rfc6797)


#### CWE Id: [ 319 ](https://cwe.mitre.org/data/definitions/319.html)


#### WASC Id: 15

#### Source ID: 3

### [ Non-Storable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are not storable by caching components such as proxy servers. If the response does not contain sensitive, personal or user-specific information, it may benefit from being stored and cached, to improve performance.

* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `private`
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/robots.txt
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `private`
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/sitemap.xml
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `private`
  * Other Info: ``

Instances: 3

### Solution

The content may be marked as storable by ensuring that the following conditions are satisfied:
The request method must be understood by the cache and defined as being cacheable ("GET", "HEAD", and "POST" are currently defined as cacheable)
The response status code must be understood by the cache (one of the 1XX, 2XX, 3XX, 4XX, or 5XX response classes are generally understood)
The "no-store" cache directive must not appear in the request or response header fields
For caching by "shared" caches such as "proxy" caches, the "private" response directive must not appear in the response
For caching by "shared" caches such as "proxy" caches, the "Authorization" header field must not appear in the request, unless the response explicitly allows it (using one of the "must-revalidate", "public", or "s-maxage" Cache-Control response directives)
In addition to the conditions above, at least one of the following conditions must also be satisfied by the response:
It must contain an "Expires" header field
It must contain a "max-age" response directive
For "shared" caches such as "proxy" caches, it must contain a "s-maxage" response directive
It must contain a "Cache Control Extension" that allows it to be cached
It must have a status code that is defined as cacheable by default (200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501).   

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3

### [ Sec-Fetch-Dest Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies how and where the data would be used. For instance, if the value is audio, then the requested resource must be audio data and not any other type of resource.

* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/robots.txt
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/sitemap.xml
  * Method: `GET`
  * Parameter: `Sec-Fetch-Dest`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: 3

### Solution

Ensure that Sec-Fetch-Dest header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Dest ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Dest)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-Mode Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Allows to differentiate between requests for navigating between HTML pages and requests for loading resources like images, audio etc.

* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/robots.txt
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/sitemap.xml
  * Method: `GET`
  * Parameter: `Sec-Fetch-Mode`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: 3

### Solution

Ensure that Sec-Fetch-Mode header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Mode ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Mode)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-Site Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies the relationship between request initiator's origin and target's origin.

* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/robots.txt
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/sitemap.xml
  * Method: `GET`
  * Parameter: `Sec-Fetch-Site`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: 3

### Solution

Ensure that Sec-Fetch-Site header is included in request headers.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Site ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Site)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Sec-Fetch-User Header is Missing ](https://www.zaproxy.org/docs/alerts/90005/)



##### Informational (High)

### Description

Specifies if a navigation request was initiated by a user.

* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/robots.txt
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/sitemap.xml
  * Method: `GET`
  * Parameter: `Sec-Fetch-User`
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: 3

### Solution

Ensure that Sec-Fetch-User header is included in user initiated requests.

### Reference


* [ https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-User ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-User)


#### CWE Id: [ 352 ](https://cwe.mitre.org/data/definitions/352.html)


#### WASC Id: 9

#### Source ID: 3

### [ Session Management Response Identified ](https://www.zaproxy.org/docs/alerts/10112/)



##### Informational (Medium)

### Description

The given response has been identified as containing a session management token. The 'Other Info' field contains a set of header tokens that can be used in the Header Based Session Management Method. If the request is in a context which has a Session Management Method set to "Auto-Detect" then this rule will change the session management to use the tokens identified.

* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/
  * Method: `GET`
  * Parameter: `9e815ea4eebc0b344dc0a7bbd4154bc5`
  * Attack: ``
  * Evidence: `633e501add1020eeb0f8e1659869e4d8`
  * Other Info: `
cookie:9e815ea4eebc0b344dc0a7bbd4154bc5`
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/robots.txt
  * Method: `GET`
  * Parameter: `9e815ea4eebc0b344dc0a7bbd4154bc5`
  * Attack: ``
  * Evidence: `633e501add1020eeb0f8e1659869e4d8`
  * Other Info: `
cookie:9e815ea4eebc0b344dc0a7bbd4154bc5`
* URL: https://bc-emli-pin-mgmt-be-c82b4c-dev.apps.silver.devops.gov.bc.ca/sitemap.xml
  * Method: `GET`
  * Parameter: `9e815ea4eebc0b344dc0a7bbd4154bc5`
  * Attack: ``
  * Evidence: `633e501add1020eeb0f8e1659869e4d8`
  * Other Info: `
cookie:9e815ea4eebc0b344dc0a7bbd4154bc5`

Instances: 3

### Solution

This is an informational alert rather than a vulnerability and so there is nothing to fix.

### Reference


* [ https://www.zaproxy.org/docs/desktop/addons/authentication-helper/session-mgmt-id ](https://www.zaproxy.org/docs/desktop/addons/authentication-helper/session-mgmt-id)



#### Source ID: 3


