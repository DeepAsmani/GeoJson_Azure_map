from flask import Flask, render_template
from dotenv import load_dotenv
import os


app = Flask(__name__)
load_dotenv()

# Fetch environment variables
azure_subscription_key = os.getenv("AZURE_MAPS_SUBSCRIPTION_KEY")
city_latitude = os.getenv("CITY_LATITUDE")
city_longitude = os.getenv("CITY_LONGITUDE")

ward_geojson = os.getenv("WARD")
libraries_geojson = os.getenv("LIBRARIES")
gyms_geojson = os.getenv("GYMS")
swimming_pools_geojson = os.getenv("SWIMMING_POOL")
zonal_office_geojson = os.getenv("ZONAL_OFFICE")
ward_office_geojson = os.getenv("WARD_OFFICE")


@app.route("/")
def show_map():
    return render_template(
        "index.html",
        city_latitude=city_latitude,
        city_longitude=city_longitude,
        ward_geojson=ward_geojson,
        libraries_geojson=libraries_geojson,
        gyms_geojson=gyms_geojson,
        swimming_pools_geojson=swimming_pools_geojson,
        zonal_office_geojson=zonal_office_geojson,
        ward_office_geojson=ward_office_geojson,
        azure_subscription_key=azure_subscription_key,
    )


if __name__ == "__main__":
    app.run(debug=True)
