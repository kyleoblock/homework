package main

import (
	"crypto/sha1"
	"encoding/hex"
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"sort"
	"strconv"
)

const (
	crlf       = "\r\n"
	colonspace = ": "
)

func ChecksumMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//Pass ServeHTTP a ResponseRecorder so we can work with the data
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, r)

		//Initialize canonical response and add status code
		newResponse := strconv.Itoa(rec.Code) + crlf

		//Parse headers and sort them lexicographically by name
		keys := make([]string, len(rec.HeaderMap))
		i := 0
		for headerName := range rec.HeaderMap {
			keys[i] = headerName
			i++
		}
		sort.Strings(keys)

		//Add header names and values to canonical response
		for _, j := range keys {
			newResponse += j + colonspace + rec.HeaderMap[j][0] + crlf
		}

		//Add X-Checksum-Headers to canonical response
		newResponse += "X-Checksum-Headers: "
		for j, k := range keys {
			newResponse += k
			if j >= len(keys)-1 {
				newResponse += crlf + crlf
			} else {
				newResponse += ";"
			}
		}

		//Add the body of original response to canonical response
		newResponse += rec.Body.String()

		//Calculate the SHA1 hash of our canonical response
		hash := sha1.New()
		hash.Write([]byte(newResponse))
		bs := hash.Sum(nil)

		//Add X-Checksum header with the hex encoded string of the hash value to original response and send that to handler
		w.Header().Set("X-Checksum", hex.EncodeToString(bs))
		h.ServeHTTP(w, r)
	})
}

// Do not change this function.
func main() {
	var listenAddr = flag.String("http", "localhost:8080", "address to listen on for HTTP")
	flag.Parse()

	l := log.New(os.Stderr, "", 1)

	http.Handle("/", ChecksumMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		l.Printf("%s - %s", r.Method, r.URL)
		w.Header().Set("X-Foo", "bar")
		w.Header().Set("Content-Type", "text/plain")
		w.Header().Set("Date", "Sun, 08 May 2016 14:04:53 GMT")
		msg := "Curiosity is insubordination in its purest form.\n"
		w.Header().Set("Content-Length", strconv.Itoa(len(msg)))
		fmt.Fprintf(w, msg)
	})))

	log.Fatal(http.ListenAndServe(*listenAddr, nil))
}
