# Node Remote Text File

Share small amounts of data. *Inspired by <https://textdb.dev/>*

Node Remote Text File gives the user a remote text file that can be accessed via an API. Think: Text "database" for small projects. You can read or write to the remote text file with your master `key`. You can have read-only access with a `readKey`. You can also have append-only access with an `appendKey`.

* Use the all-access master `key` from your backend.
* Use the `appendKey` and endpoint to store data to your remote text file. For example, comments for a blog, or contact form details.
* Fetch all data (also possible via AJAX) by using the `readKey`.

Internally, it uses SQLite as storage for text files.

## API

### GET /api/hello

Initiates a new text file and generates the access keys for you.

```
key:        your full-access master key
readKey:    read-only key to retrieve all data
appendKey:  write-only key to append to the text file
```

Example:
```
$ curl http://localhost:8080/api/hello
{"key":"c11c2858-0d4b-4e94-b8ab-900409a0f4d7","readKey":"r-766035153b71e06efe425867488483eecebcfd595a955825ba06571295f2771d","appendKey":"a-4fb8a5b5e7c26b4c827692050343f6f7d1c53ea66c327db04d8dff15e021811e"}
```

### POST /api/data/<key>

Saves whatever you post to the endpoint to the remote text file (and overwrites existing data).

Try it:
```
$ curl -d "Hello world!" http://localhost:8080/api/data/c11c2858-0d4b-4e94-b8ab-900409a0f4d7
```

### GET /api/data/<key|readKey>

Retrieves all content from the remote text file or an empty string if no data was set yet.

Try it:
```
$ curl http://localhost:8080/api/data/r-766035153b71e06efe425867488483eecebcfd595a955825ba06571295f2771d
```

### POST /api/data/append/<key|appendKey>

Appends whatever you post to the endpoint to the remote text file.

Try it:
```
$ curl -d "How are you?" http://localhost:8080/api/data/append/c11c2858-0d4b-4e94-b8ab-900409a0f4d7
```

## Security & Misc

* CORS enabled, you can do AJAX requests. This way, Node Remote Text File can be used for dynamic content in static websites.
* No input or output validation whatsoever. Be aware of XSS attacks. Users could write arbitrary data to the text file. No restriction in length.
* No options to retrieve data in a structured way. You gotta do this client-side (or in your own app).
* Made to be used behind a reverse proxy, because it doesn't use Express or any other web framework. It's barebones Node/HTTP.
* Dependenices: only `uuid` and `better-sqlite3`
* License: MIT

Created by Chris Maas <https://www.cmaas.de/>