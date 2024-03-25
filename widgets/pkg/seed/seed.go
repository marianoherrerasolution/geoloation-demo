package seed

import (
	"fmt"
	"math/rand"
	"strconv"
	"time"
	"widgetz/dal"
	"widgetz/model"
)

// Point represents a latitude and longitude pair.
type Point struct {
	Lat, Lon float64
}

// seed data 30 days from all widgets
// each widget will have 10-20 request daily
func Run() {
	var widgets []model.Widget
	dal.Find(&widgets)
	fmt.Println(len(widgets))
	now := time.Now().UTC()
	endDate := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	// Calculate the end date (30 days from now)
	startDate := endDate.AddDate(0, 0, -30)

	// Loop through the dates
	for currentDate := startDate; currentDate.Before(endDate); currentDate = currentDate.AddDate(0, 0, 1) {
		fmt.Printf("Seed %s\n", currentDate.Format("2006-01-02"))
		for _, widget := range widgets {
			var restrictions []model.RestrictionWithCoordinates
			raw := fmt.Sprintf(`
				SELECT id, product_id, address_lat, address_lon FROM restrictions r1 
				WHERE EXISTS (
					SELECT 1 FROM widgets w1
					WHERE id = %d 
					AND (
						(w1.restriction_type = 'product_base' AND r1.product_id IN (SELECT unnest(w1.product_ids))) 
						OR 
						r1.id IN (SELECT unnest(w1.restriction_ids))
					)	
				)
			`, widget.ID)
			fmt.Printf("Widget ID %d\n", widget.ID)
			dal.Raw(raw).Find(&restrictions)
			fmt.Printf("... Restrictions: %d\n", len(restrictions))
			randomlocations := []Point{}

			for _, restriction := range restrictions {
				totalfake := rand.Intn(35) + 5
				fmt.Printf("... Restriction ID: %d, total fake %d\n", restriction.ID, totalfake)
				for i := 0; i < totalfake; i += 1 {
					decimalvariant := []string{"0.0", "0.00", "0."}
					for _, dv := range decimalvariant {
						latdec, _ := strconv.ParseFloat(fmt.Sprintf("%s%d", dv, rand.Intn(89999)+10000), 64)
						londec, _ := strconv.ParseFloat(fmt.Sprintf("%s%d", dv, rand.Intn(89999)+10000), 64)

						randomlocations = append(randomlocations, Point{
							Lat: restriction.AddressLat + latdec,
							Lon: restriction.AddressLon + londec,
						})
					}
				}
			}

			for _, loc := range randomlocations {
				var matches []model.RestrictionV3
				if tx := dal.RestrictionQueryByWidget(widget, loc.Lat, loc.Lon).Find(&matches); tx.Error != nil {
					panic(tx.Error)
				}
				if len(matches) < 1 {
					dal.RestrictionsByRadiusWidget(100000, widget, loc.Lat, loc.Lon).Find(&matches)
				}

				fmt.Printf("total matches: %d\n", len(matches))

				for _, matche := range matches {
					widgetUsage := &model.WidgetUsage{
						ClientID:      widget.ClientID,
						RestrictionID: matche.ID,
						ProductID:     matche.ProductID,
						Allow:         matche.Allow,
						WidgetID:      widget.ID,
						ParamsIP:      "",
						Referer:       "populate",
						RemoteIP:      "127.0.0.1",
						Point:         fmt.Sprintf("POINT(%g %g)", loc.Lon, loc.Lat),
						Latitude:      loc.Lat,
						Longitude:     loc.Lon,
						Distance:      matche.Distance,
					}

					randomsecond := rand.Intn(86400-3600) + 3600
					widgetUsage.CreatedAt = currentDate.Add(time.Duration(randomsecond) * time.Second)

					if matche.Distance > 0 {
						if matche.Allow == 1 {
							widgetUsage.Allow = 2
						} else {
							widgetUsage.Allow = 1
						}
					}

					fmt.Printf("......Created WU ID %d: [%g, %g] allow: %d\n", widgetUsage.ID, loc.Lon, loc.Lat, widgetUsage.Allow)
					tx := dal.Create(widgetUsage)
					if tx.Error != nil {
						panic(tx.Error)
					}

				}
			}
		}
	}
}
