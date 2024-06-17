package maxmind

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"widgetz/config/env"
)

// Webservice is a client for the GeoIP2 API.
type Webservice struct {
	accountID  string
	licenseKey string
	host       string
}

// New creates a new GeoIP2 API client.
func New(accountID, licenseKey, host string) *Webservice {
	return &Webservice{
		accountID:  accountID,
		licenseKey: licenseKey,
		host:       host,
	}
}

// City returns GeoIP2 city information for the given IP address.
func City(ipAddress string) (GeoIPInfo, error) {
	webservice := New(env.Vars.MAXMIND_ACCOUNT_ID, env.Vars.MAXMIND_LICENSE_KEY, "geoip.maxmind.com")
	return webservice.request("/geoip/v2.1/city/", ipAddress)
}

// Country returns GeoIP2 country information for the given IP address.
func Country(ipAddress string) (GeoIPInfo, error) {
	webservice := New(env.Vars.MAXMIND_ACCOUNT_ID, env.Vars.MAXMIND_LICENSE_KEY, "geolite.info")
	return webservice.request("/geoip/v2.1/city/", ipAddress)
}

// Country returns GeoIP2 country information for the given IP address.
func (a *Webservice) Country(ipAddress string) (GeoIPInfo, error) {
	return a.request("/geoip/v2.1/country/", ipAddress)
}

// City returns GeoIP2 city information for the given IP address.
func (a *Webservice) City(ipAddress string) (GeoIPInfo, error) {
	return a.request("/geoip/v2.1/city/", ipAddress)
}

// Insights returns GeoIP2 insights information for the given IP address.
func (a *Webservice) Insights(ipAddress string) (GeoIPInfo, error) {
	return a.request("/geoip/v2.1/insights/", ipAddress)
}

// request makes a request to the GeoIP2 API.
func (a *Webservice) request(prefix, ipAddress string) (GeoIPInfo, error) {
	// Build the request URL.
	request := fmt.Sprintf("https://%s%s%s", a.host, prefix, ipAddress)

	// Create a GeoIPInfo struct.
	var data GeoIPInfo

	// Create the HTTP request.
	req, err := http.NewRequest("GET", request, nil)
	if err != nil {
		fmt.Println("Error creating HTTP request:", err)
		return GeoIPInfo{}, err
	}

	// Set the request headers.
	req.SetBasicAuth(a.accountID, a.licenseKey)

	// Send the HTTP request.
	client := &http.Client{}

	// Get the HTTP response.
	response, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending HTTP request:", err)
		return GeoIPInfo{}, err
	}

	// Close the response body.
	defer response.Body.Close()

	// Check the HTTP status code.
	if response.StatusCode != http.StatusOK {
		fmt.Println("HTTP request failed with status code", response.StatusCode)
		return GeoIPInfo{}, err
	}

	// Read the response body.
	body, err := io.ReadAll(response.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return GeoIPInfo{}, err
	}

	// Unmarshal the JSON response.
	err = json.Unmarshal(body, &data)
	if err != nil {
		fmt.Println("Error unmarshaling JSON:", err)
		return GeoIPInfo{}, err
	}

	// Return the GeoIPInfo struct.
	return data, nil
}
