package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"geonius/config"
	db "geonius/database"
	"geonius/model"
	"geonius/routes"
	"io"
	"net/http"
	"os"
	"testing"

	"github.com/valyala/fasthttp"

	"github.com/stretchr/testify/assert"
)

const (
	TestURL = "http://localhost:4005"
)

// remigrate() to drop tables and recreate tables()
func remigrate() {
	fmt.Println("drop tables ...")
	db.Pg.Migrator().DropTable(&model.User{})
	db.Pg.Migrator().DropTable(&model.AccessedLocation{})
	fmt.Println("create tables ...")
	db.Migrate()
}

// setup() to setup environment variable and database connection for TEST
func setup() {
	fmt.Println("Setup test environment ...")
	os.Setenv("TEST", "1")
	config.Init()
	db.InitPostgres()
	remigrate()
}

func runServer() {
	appRouter := routes.Init()
	fmt.Println("Server test localhost:4005")
	go fasthttp.ListenAndServe(":4005", appRouter.Handler)
}

// TestMain() to run test with command `go test -run TestMain geonius/test`
func TestMain(t *testing.T) {
	setup()
	fmt.Println("Setup test environment ...")
	runServer()
	testUserAPI(t)
	testAddLocation(t)
}

func testUserAPI(t *testing.T) {
	testCreateUser(t)
	testUserList(t)
	testUserUpdate(t)
	testUserShow(t)
	testUserLogin(t)
	testUserDelete(t)
}

func testPath(path string) string {
	return fmt.Sprintf("%s%s", TestURL, path)
}

func testCreateUser(t *testing.T) {
	fmt.Println("POST /users should create user with ID = 1")
	t.Run(`POST /users`, func(t *testing.T) {
		httpClient := http.DefaultClient
		var userJSON = []byte(`{
			"fName": "Lorem",
			"lName": "Ipsum",
			"email": "lorem@ipsum.host",
			"password": "dolorcit1234"
		}`)
		req, err := http.NewRequest(`POST`, testPath("/users"), bytes.NewBuffer(userJSON))
		assert.Empty(t, err, "should not error request")
		if err != nil {
			return
		}

		res, err := httpClient.Do(req)
		assert.Empty(t, err, "should not respond error")
		if err != nil {
			return
		}

		assert.Equal(t, res.StatusCode, 200)
		b, _ := io.ReadAll(res.Body)
		var user model.User
		json.Unmarshal(b, &user)
		fmt.Println(user.ID)
		assert.Equal(t, uint(1), user.ID, fmt.Sprintf("User ID should be 1 = %d", user.ID))
	})
}

func testUserList(t *testing.T) {
	fmt.Println("GET /users should return a user")
	t.Run(`GET /users`, func(t *testing.T) {
		httpClient := http.DefaultClient
		req, err := http.NewRequest(`GET`, testPath("/users"), nil)
		assert.Empty(t, err, "should not error request")
		if err != nil {
			return
		}

		res, err := httpClient.Do(req)
		assert.Empty(t, err, "should not respond error")
		if err != nil {
			return
		}

		assert.Equal(t, res.StatusCode, 200)
		b, _ := io.ReadAll(res.Body)
		var users []model.User
		json.Unmarshal(b, &users)
		assert.Equal(t, len(users), 1, "Total users should be 1")
	})
}

func testUserUpdate(t *testing.T) {
	fmt.Println("PUT /users/1 should update user")
	t.Run(`PUT /users/1`, func(t *testing.T) {
		httpClient := http.DefaultClient
		var userJSON = []byte(`{
			"fName": "Dolor",
			"lName": "Cit",
			"email": "dolor@cit.host",
			"password": "lorem123"
		}`)
		req, err := http.NewRequest(`PUT`, testPath("/users/1"), bytes.NewBuffer(userJSON))
		assert.Empty(t, err, "should not error request")
		if err != nil {
			return
		}

		res, err := httpClient.Do(req)
		assert.Empty(t, err, "should not respond error")
		if err != nil {
			return
		}

		assert.Equal(t, res.StatusCode, 200)
		b, _ := io.ReadAll(res.Body)
		var user model.User
		json.Unmarshal(b, &user)
		assert.Equal(t, user.FirstName, "Dolor", "First name should be Dolor")
		assert.Equal(t, user.LastName, "Cit", "Last name should be Cit")
		assert.Equal(t, user.Email, "dolor@cit.host", "Email should be dolor@cit.host")
		assert.Equal(t, user.Password, "lorem123", "Password should be lorem123")
	})
}

func testUserShow(t *testing.T) {
	fmt.Println("GET /users/1 should get user detail")
	t.Run(`GET /users/1`, func(t *testing.T) {
		httpClient := http.DefaultClient
		req, err := http.NewRequest(`PUT`, testPath("/users/1"), nil)
		assert.Empty(t, err, "should not error request")
		if err != nil {
			return
		}

		res, err := httpClient.Do(req)
		assert.Empty(t, err, "should not respond error")
		if err != nil {
			return
		}

		assert.Equal(t, res.StatusCode, 200)
		b, _ := io.ReadAll(res.Body)
		var user model.User
		json.Unmarshal(b, &user)
		assert.Equal(t, user.ID, uint(1), "should have ID = 1")
		assert.Equal(t, user.Email, "dolor@cit.host", "should email dolor@cit.host")

	})
}

func testUserLogin(t *testing.T) {
	fmt.Println("POST /users/:email should create user with ID = 1")
	t.Run(`POST /users/:email`, func(t *testing.T) {
		httpClient := http.DefaultClient
		var userJSON = []byte(`{
			"password": "lorem123"
		}`)
		req, err := http.NewRequest(`POST`, testPath("/users/dolor@cit.host"), bytes.NewBuffer(userJSON))
		assert.Empty(t, err, "should not error request")
		if err != nil {
			return
		}

		res, err := httpClient.Do(req)
		assert.Empty(t, err, "should not respond error")
		if err != nil {
			return
		}

		assert.Equal(t, res.StatusCode, 200)
		b, _ := io.ReadAll(res.Body)
		var user model.User
		json.Unmarshal(b, &user)
		assert.Equal(t, uint(1), user.ID, fmt.Sprintf("User ID should be 1 = %d", user.ID))
	})
}

func testUserDelete(t *testing.T) {
	fmt.Println("DELETE /users/1 should deete user")
	t.Run(`DELETE /users/1`, func(t *testing.T) {
		httpClient := http.DefaultClient
		req, err := http.NewRequest(`DELETE`, testPath("/users/1"), nil)
		assert.Empty(t, err, "should not error request")
		if err != nil {
			return
		}

		res, err := httpClient.Do(req)
		assert.Empty(t, err, "should not respond error")
		if err != nil {
			return
		}

		assert.Equal(t, res.StatusCode, 200)
		b, _ := io.ReadAll(res.Body)
		var result map[string]interface{}
		json.Unmarshal(b, &result)
		assert.True(t, result["success"].(bool), "success should be true")
	})
}

func testAddLocation(t *testing.T) {
	fmt.Println("POST /location should create new location")
	t.Run(`POST /location`, func(t *testing.T) {
		httpClient := http.DefaultClient
		var data = []byte(`{
			"city": "mephis",
			"country": "United State America",
			"zip_code": "13112",
			"lat": 35.17926638047639,
			"lon": -90.05742233886744,
			"ip": "139.195.84.42"
		}`)
		req, err := http.NewRequest(`POST`, testPath("/location"), bytes.NewBuffer(data))
		assert.Empty(t, err, "should not error request")
		if err != nil {
			return
		}

		res, err := httpClient.Do(req)
		assert.Empty(t, err, "should not respond error")
		if err != nil {
			return
		}

		assert.Equal(t, res.StatusCode, 201)
		b, _ := io.ReadAll(res.Body)
		assert.Equal(t, string(b), "Location added with ID: 1")
	})
}
