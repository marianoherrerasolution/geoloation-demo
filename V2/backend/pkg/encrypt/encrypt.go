package encrypt

import (
	"crypto/sha1"
	"encoding/hex"
)

func Sha1(txt string) string {
	s := sha1.New()
	s.Write([]byte(txt))
	return hex.EncodeToString(s.Sum(nil))
}
