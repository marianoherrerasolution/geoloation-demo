package stringify

import (
	"regexp"
	"strings"
)

func LowerTrim(txt string) string {
	return strings.ToLower(strings.Trim(txt, " "))
}

func SafetySQL(s string) string {
	sqlInjectionPattern := regexp.MustCompile(`(?i)\b(?:SELECT|UPDATE|DELETE|INSERT|ALTER|DROP|UNION|AND|OR|WHERE|FROM)\b`)
	sanitizedInput := sqlInjectionPattern.ReplaceAllString(s, "")
	sqlInjectionPattern2 := regexp.MustCompile(`[;,\/'"=*]`)
	sanitizedInput = sqlInjectionPattern2.ReplaceAllString(sanitizedInput, "")
	return strings.Trim(sanitizedInput, " ")
}
