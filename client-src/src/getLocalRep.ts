import { getStorageKey, setStorageKey } from "./chrome";
import { LocalRep } from "./types";

const GEOCODIO_KEY = "2f0fb3787007bde333e78bb838bfeb66362d29d";

type GeocodioResponse = {
    results: {
        address_components: {
            state: string
        },
        fields: {
            congressional_districts: {
                district_number: number,
                current_legislators: {
                    bio: {
                        first_name: string,
                        last_name: string,
                        party: string
                    }
                }[]
            }[]
        }
    }[]
}

export async function getLocalRep(): Promise<LocalRep> {
    const storedLocalRep = await getStorageKey("localRep");
    if (storedLocalRep) return JSON.parse(storedLocalRep || "");

    const coords = await getCoords();
    const response: GeocodioResponse = await (await fetch(`https://api.geocod.io/v1.7/reverse?q=${coords.latitude},${coords.longitude}&fields=cd&api_key=${GEOCODIO_KEY}`)).json();

    if (response.results.length == 0) return {data: null};

    const result = response.results[0];
    const localRep = {data:
        {
            firstName: result.fields.congressional_districts[0].current_legislators[0].bio.first_name,
            lastName: result.fields.congressional_districts[0].current_legislators[0].bio.last_name,
            partyLetter: result.fields.congressional_districts[0].current_legislators[0].bio.party.charAt(0),
            state: result.address_components.state,
            district: result.fields.congressional_districts[0].district_number
        }
    }

    await setStorageKey("localRep", JSON.stringify(localRep));
    return localRep;
}

function getCoords(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            position => resolve(position.coords),
            error => reject(error)
        );
    });
}