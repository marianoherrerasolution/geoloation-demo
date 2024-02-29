package ipgeo

import (
	"crypto/tls"
	"fmt"
	"math/rand"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/imroc/req/v3"
)

var UserAgents = []string{
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.",
	"Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.3",
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.3",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edge/44.18363.8131",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1788.0",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.4",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Agency/99.8.2237.3",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.3",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.3",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.1",
}

func RandomUserAgent() string {
	return UserAgents[rand.Intn(len(UserAgents)-1)]
}

// IsRetriable method checks the respond code is retriable or not.
// Retriable code is 429 (Too Many Request), 400 (Bad Request), 403 (Forbidden) or 500 (Server Error).
func IsRetriable(code int) bool {
	return code == http.StatusTooManyRequests || code == http.StatusBadRequest || code == http.StatusForbidden || code == http.StatusInternalServerError
}

func Client() *req.Client {
	return req.C().
		SetUserAgent(RandomUserAgent()).
		SetTimeout(20*time.Second).
		SetTLSClientConfig(&tls.Config{InsecureSkipVerify: true}).
		SetCommonRetryCount(2).
		SetCommonRetryBackoffInterval(500*time.Millisecond, 1500*time.Millisecond).
		SetCommonRetryCondition(func(resp *req.Response, err error) bool {
			return (err != nil) || IsRetriable(resp.StatusCode)
		})
}

func New() *req.Request {
	return Client().R().DisableAutoReadResponse().DisableTrace()
}

func Remote(ip string) (GeoLocation, error) {
	result := GeoLocation{}
	resp, err := New().Get(fmt.Sprintf("https://db-ip.com/%s", ip))
	if err != nil {
		return result, err
	}

	if resp.StatusCode > 299 {
		return result, fmt.Errorf("status code error: %d %s", resp.StatusCode, resp.Status)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return result, err
	}

	doc.Find("th").Each(func(i int, s *goquery.Selection) {
		notfound := true
		if strings.Contains(strings.ToLower(s.Text()), "country") {
			result.CountryName = s.Next().Text()
			notfound = false
		}
		if notfound && strings.Contains(strings.ToLower(s.Text()), "state") {
			result.StateProv = s.Next().Text()
			notfound = false
		}
		if notfound && strings.Contains(strings.ToLower(s.Text()), "city") {
			result.City = s.Next().Text()
			notfound = false
		}
		if notfound && strings.Contains(strings.ToLower(s.Text()), "zip") {
			result.Zipcode = s.Next().Text()
			notfound = false
		}
		if notfound && strings.Contains(strings.ToLower(s.Text()), "coordinates") {
			coordinates := strings.Split(s.Next().Text(), ",")
			result.Latitude = coordinates[0]
			result.Longitude = coordinates[1]
			notfound = false
		}
		if notfound && strings.Contains(strings.ToLower(s.Text()), "timezone") {
			timezone := s.Next().Text()
			re := regexp.MustCompile(`(?i)\(UTC.*?\)`)
			matches := re.FindAllString(timezone, -1)
			offset := strings.Join(matches, "")
			if offset != "" {
				timezone = strings.TrimSpace(strings.ReplaceAll(timezone, offset, ""))
			}
			result.Timezone = GeoTimezone{Name: timezone}
			notfound = false
		}
		if notfound && strings.Contains(strings.ToLower(s.Text()), "currency") {
			result.Currency = GeoCurrency{Name: s.Next().Text()}
			notfound = false
		}
	})

	return result, nil
}
