package encrypt

import (
	"crypto/md5"
	"crypto/rand"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"
)

// Sha1() to encrypt in SHA1
func Sha1(txt string) string {
	s := sha1.New()
	s.Write([]byte(txt))
	return hex.EncodeToString(s.Sum(nil))
}

// GenerateToken() to generate token in 24 character alphanumeric
func GenerateToken() string {
	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		return Sha1(fmt.Sprintf("%d", time.Now().Local().UnixMicro()))
	}
	return hex.EncodeToString(b)
}

// ValidateRequest() to validate request token in header
// format: unixstamp.encrypttext.userID.loginToken
func ValidateRequest(auth string, accessType string) (bool, string) {
	bearer := strings.Replace(auth, "Bearer ", "", -1)
	if bearer == "" {
		return false, ""
	}

	tokens := strings.Split(bearer, ".")
	if len(tokens) < 4 || tokens[1] == "" {
		return false, ""
	}

	unixstampTxt := tokens[0]
	encryptedText := tokens[1]
	userIDTxt := tokens[2]
	loginToken := tokens[3]

	unixstamp, err := strconv.ParseInt(unixstampTxt, 10, 64)
	if err != nil {
		return false, "" //unixstamp invalid
	}

	diff := time.Now().Unix() - unixstamp
	if diff >= 65 {
		return false, "" //token expired if more than 65 seconds
	}

	//
	return ChiperAuthorization(userIDTxt, unixstampTxt, loginToken, accessType) == encryptedText, userIDTxt //token ecryption valid
}

// EncryptMD5() to encrypt md5
func EncryptMD5(chipertext string) string {
	hasher := md5.New()
	hasher.Write([]byte(chipertext))
	return hex.EncodeToString(hasher.Sum(nil))
}

// ChiperAuthorization() to encrypt header token, format is sha1(md5(timestamp:logintoken:accessType), userID)
func ChiperAuthorization(userID string, timestamp string, loginToken string, accessType string) string {
	newSHA1 := sha1.New()
	newSHA1.Write([]byte(fmt.Sprintf("%s:%s", EncryptMD5(fmt.Sprintf("%s:%s:%s", timestamp, loginToken, accessType)), userID)))
	return fmt.Sprintf("%x", newSHA1.Sum(nil))
}
