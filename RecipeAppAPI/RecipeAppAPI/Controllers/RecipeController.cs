using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System.Drawing.Printing;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RecipeAppAPI.Controllers
{
    [Route("api/recipes")]
    [ApiController]
    public class RecipeController : ControllerBase
    {

        private readonly HttpClient httpClient;
        private int from;
        private int to;
        private List<string> PreviousPages;
        private int thisPg;

        public RecipeController(IHttpClientFactory httpClientFactory)
        {
            httpClient = httpClientFactory.CreateClient();
            from = 0;
            to = 0;
            thisPg = 1;
            PreviousPages = new List<string>();
        }
     [HttpGet("/GetPage/{page}")]
public async Task<IActionResult> GetPage(int page)
{
    try
    {
        if (page <= 0)
        {
            return BadRequest("Invalid page number");
        }

        while (thisPg < page && PreviousPages.Count > 0)
        {
            // Get the next page
            await GetNextInternal();
        }

        string url = (page <= PreviousPages.Count) ? PreviousPages.Last() : "";

        if (string.IsNullOrEmpty(url))
        {
            return NotFound("Page not available");
        }

        // Send the HTTP GET request
        HttpResponseMessage response = await httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        // Read the response content as a string
        string responseBody = await response.Content.ReadAsStringAsync();

        var json = JObject.Parse(responseBody);
        var nextLink = json["_links"]?["next"]?["href"]?.ToString();

        if (!string.IsNullOrEmpty(nextLink))
        {
            PreviousPages.Add(nextLink);
        }

        // Update the current page number
        thisPg = page;

        // Return the response as JSON
        return Ok(responseBody);
    }
    catch (Exception ex)
    {
        // Log the exception
        Console.WriteLine($"An error occurred in GetPage: {ex.Message}");
        return StatusCode(500, $"An error occurred: {ex.Message}");
    }
}

private async Task GetNextInternal()
{
    try
    {
        if (PreviousPages == null || !PreviousPages.Any())
        {
            // Log or handle the case where PreviousPages is null or empty
            return;
        }

        string appId = "89c68f46";
        string appKey = "41fb7f41e7818b87c557110853921ded";
        string url = PreviousPages.Last();

        // Send the HTTP GET request
        HttpResponseMessage response = await httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        // Read the response content as a string
        string responseBody = await response.Content.ReadAsStringAsync();
        var json = JObject.Parse(responseBody);

        thisPg++;
        var nextLink = json["_links"]?["next"]?["href"]?.ToString();
                Console.WriteLine($"Next Href: {nextLink}");

        if (!string.IsNullOrEmpty(nextLink))
        {
            PreviousPages.Add(nextLink);
        }
    }
    catch (Exception ex)
    {
        // Log the exception
        Console.WriteLine($"An error occurred in GetNextInternal: {ex.Message}");
        throw; // Rethrow the exception if necessary
    }
}



        [ResponseCache(Duration = 3600)]
        [HttpGet("/GetPrevious")]
        public async Task<IActionResult> GetPrevious()
        {
            try
            {
                string appId = "89c68f46";
                string appKey = "41fb7f41e7818b87c557110853921ded";
                string url = "";

                url = PreviousPages[PreviousPages.Count-3];
                PreviousPages.RemoveAt(PreviousPages.Count - 1);
                // Send the HTTP GET request
                HttpResponseMessage response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                // Read the response content as a string
                string responseBody = await response.Content.ReadAsStringAsync();
                
                
                // Return the response as JSON
                return Ok(responseBody);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        [ResponseCache(Duration = 3600)]
        [HttpGet("/GetNext")]
        public async Task<IActionResult> GetNext()
        {
            try
            {
                string appId = "89c68f46";
                string appKey = "41fb7f41e7818b87c557110853921ded";
                string url = "";

                url = PreviousPages[PreviousPages.Count-1];

                // Send the HTTP GET request
                HttpResponseMessage response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                // Read the response content as a string
                string responseBody = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(responseBody);
                var nextLink = json["_links"]?["next"]?["href"]?.ToString();
                if (PreviousPages.Count == 0) { PreviousPages.Add(url); }
                if (!string.IsNullOrEmpty(nextLink))
                {
                    PreviousPages.Add(nextLink);
                }
                from = int.Parse(json["from"].ToString());
                to = int.Parse(json["to"].ToString());

                // Return the response as JSON
                return Ok(responseBody);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        [ResponseCache(Duration = 3600)]
        [HttpGet("/GetAll")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                string appId = "89c68f46";
                string appKey = "41fb7f41e7818b87c557110853921ded";
                string url = "";
                if (DateTime.UtcNow.Hour >= 6 && DateTime.UtcNow.Hour <= 11)
                {
                    url = $"https://api.edamam.com/api/recipes/v2?type=any&mealType=Breakfast&app_id={appId}&app_key={appKey}";
                }
                else if (DateTime.UtcNow.Hour >= 12 && DateTime.UtcNow.Hour <= 17)
                {
                    url = $"https://api.edamam.com/api/recipes/v2?type=any&mealType=Lunch&app_id={appId}&app_key={appKey}";
                }
                else if (DateTime.UtcNow.Hour >= 18 && DateTime.UtcNow.Hour <= 22)
                {
                    url = $"https://api.edamam.com/api/recipes/v2?type=any&mealType=Dinner&app_id={appId}&app_key={appKey}";
                }
                else
                {
                    url = $"https://api.edamam.com/api/recipes/v2?type=any&mealType=Snack&app_id={appId}&app_key={appKey}";
                }
                // Send the HTTP GET request
                HttpResponseMessage response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                // Read the response content as a string
                string responseBody = await response.Content.ReadAsStringAsync();

                // Return the response as JSON
                return Ok(responseBody);
                // Send the HTTP GET request
                // HttpResponseMessage response = await httpClient.GetAsync(url);
                // response.EnsureSuccessStatusCode();

                //thisPg = 1;
                // Read the response content as a string
                // string responseBody = await response.Content.ReadAsStringAsync();
                //var json = JObject.Parse(responseBody);
                // return Ok(responseBody);
                /* var nextLink = json["_links"]?["next"]?["href"]?.ToString();
                 if(PreviousPages.Count == 0) { PreviousPages.Add(url); }
                 if (!string.IsNullOrEmpty(nextLink))
                 {
                     PreviousPages.Add(nextLink);
                 }*/

                // Return the response as JSON

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        [Route("Get")]
       // [ResponseCache(Duration = 3600)]
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                string appId = "89c68f46";
                string appKey = "41fb7f41e7818b87c557110853921ded";
                string url = "";
                if (DateTime.UtcNow.Hour >= 6 && DateTime.UtcNow.Hour <= 11)
                {
                    url = $"https://api.edamam.com/api/recipes/v2?type=any&mealType=Breakfast&app_id={appId}&app_key={appKey}";
                }
                else if (DateTime.UtcNow.Hour >= 12 && DateTime.UtcNow.Hour <= 17)
                {
                    url = $"https://api.edamam.com/api/recipes/v2?type=any&mealType=Lunch&app_id={appId}&app_key={appKey}";
                }
                else if (DateTime.UtcNow.Hour >= 18 && DateTime.UtcNow.Hour <= 22)
                {
                    url = $"https://api.edamam.com/api/recipes/v2?type=any&mealType=Dinner&app_id={appId}&app_key={appKey}";
                }
                else
                {
                    url = $"https://api.edamam.com/api/recipes/v2?type=any&mealType=Snack&app_id={appId}&app_key={appKey}";
                }
                // Send the HTTP GET request
                HttpResponseMessage response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                // Read the response content as a string
                string responseBody = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(responseBody);
                // return Ok(responseBody);
                thisPg = 1;
                 var nextLink = json["_links"]?["next"]?["href"]?.ToString();
                 if(PreviousPages.Count == 0) { PreviousPages.Add(url); }
                 if (!string.IsNullOrEmpty(nextLink))
                 {
                     PreviousPages.Add(nextLink);
                 }
                // Return the response as JSON
                return Ok(responseBody);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        [Route("GetByMealType/{type}")]
        [HttpGet]
        public async Task<IActionResult> GetByMealType(string type)
        {
            try
            {
                string appId = "89c68f46";
                string appKey = "41fb7f41e7818b87c557110853921ded";
                string url = $"https://api.edamam.com/api/recipes/v2?type=any&mealType={type}&app_id={appId}&app_key={appKey}";


                // Send the HTTP GET request
                HttpResponseMessage response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                // Read the response content as a string
                string responseBody = await response.Content.ReadAsStringAsync();

                // Return the response as JSON
                return Ok(responseBody);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        [Route("GetByHealth")]
        [HttpGet]
        public async Task<IActionResult> GetByHealth(string healthLabel)
        {
            try
            {
                string appId = "89c68f46";
                string appKey = "41fb7f41e7818b87c557110853921ded";
                string url = $"https://api.edamam.com/api/recipes/v2?type=any&health={healthLabel}&app_id={appId}&app_key={appKey}";
                

                // Send the HTTP GET request
                HttpResponseMessage response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                // Read the response content as a string
                string responseBody = await response.Content.ReadAsStringAsync();

                // Return the response as JSON
                return Ok(responseBody);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        [Route("GetByDiet")]
        [HttpGet]
        public async Task<IActionResult> GetByDiet(string dietLabel)
        {
            try
            {
                string appId = "89c68f46";
                string appKey = "41fb7f41e7818b87c557110853921ded";
                string url = $"https://api.edamam.com/api/recipes/v2?type=any&diet={dietLabel}&app_id={appId}&app_key={appKey}";


                // Send the HTTP GET request
                HttpResponseMessage response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();

                // Read the response content as a string
                string responseBody = await response.Content.ReadAsStringAsync();

                // Return the response as JSON
                return Ok(responseBody);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        [Route("GetByCalories")]
        [HttpGet]
        public async Task<IActionResult> GetByCalories(int min, int max)
        {
            try
            {
                string appId = "89c68f46";
                string appKey = "41fb7f41e7818b87c557110853921ded";
                string url = $"https://api.edamam.com/api/recipes/v2?type=any&calories={min}-{max}&app_id={appId}&app_key={appKey}";

                // Send the HTTP GET request
                HttpResponseMessage response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                // Read the response content as a string
                string responseBody = await response.Content.ReadAsStringAsync();

                // Return the response as JSON
                return Ok(responseBody);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
        [Route("GetRecipeByName/{name}")]
        [HttpGet]
        public async Task<IActionResult> GetRecipeByName(string name)
        {
            try
            {
                string appId = "89c68f46";
                string appKey = "41fb7f41e7818b87c557110853921ded";
                string url = $"https://api.edamam.com/api/recipes/v2?type=any&q={name}&app_id={appId}&app_key={appKey}";

                // Send the HTTP GET request
                HttpResponseMessage response = await httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                // Read the response content as a string
                string responseBody = await response.Content.ReadAsStringAsync();

                // Return the response as JSON
                return Ok(responseBody);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


    }
}

