using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using recipeappAPI.Data;
using recipeappAPI.Models;

namespace recipeappAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SavedRecipesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SavedRecipesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/SavedRecipes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SavedRecipe>>> GetSavedRecipes(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required.");
            }

            // Filter the saved recipes based on the provided userId
            var savedRecipes = await _context.SavedRecipes
                .Where(recipe => recipe.userId == userId)
                .ToListAsync();


            return Ok(savedRecipes);
        }

        [HttpGet("/byTerm")]
        public async Task<ActionResult<IEnumerable<SavedRecipe>>> GetSavedRecipesByTerm([FromQuery] string term)
        {
            if (string.IsNullOrEmpty(term))
            {
                return BadRequest("Search term is required.");
            }

            var matchingRecipes = await _context.SavedRecipes
                .Where(recipe =>
                    EF.Functions.Like(recipe.Title, $"%{term}%") || // Adjust based on your actual property names
                    EF.Functions.Like(recipe.DietLabels, $"%{term}%") 
                  
                    // Add more properties as needed
                    // ...
                )
                .ToListAsync();

            return Ok(matchingRecipes);
        }

        // GET: api/SavedRecipes/5
        [HttpGet("/recipe")]
        public async Task<ActionResult<SavedRecipe>> GetSavedRecipe([FromQuery] string userId, [FromQuery] string url)
        {
            if (_context.SavedRecipes == null)
            {
                return NotFound();
            }

            var savedRecipe = await _context.SavedRecipes
                .FirstOrDefaultAsync(r => r.userId == userId && r.Url == url);

            if (savedRecipe == null)
            {
                return null;
            }

            return savedRecipe;
        }



        // PUT: api/SavedRecipes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSavedRecipe(int id, SavedRecipe savedRecipe)
        {
            if (id != savedRecipe.Id)
            {
                return BadRequest();
            }

            _context.Entry(savedRecipe).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SavedRecipeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/SavedRecipes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SavedRecipe>> PostSavedRecipe(SavedRecipe savedRecipe)
        {
          if (_context.SavedRecipes == null)
          {
              return Problem("Entity set 'ApplicationDbContext.SavedRecipes'  is null.");
          }
            _context.SavedRecipes.Add(savedRecipe);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSavedRecipe", new { id = savedRecipe.Id }, savedRecipe);
        }

        // DELETE: api/SavedRecipes/5
        [HttpDelete]
        public async Task<IActionResult> DeleteSavedRecipe([FromQuery] string userId, [FromQuery] string url)
        {
            if (_context.SavedRecipes == null)
            {
                return NotFound("SavedRecipes DbSet is null");
            }

            try
            {
                var savedRecipe = await _context.SavedRecipes
                    .FirstOrDefaultAsync(r => r.userId == userId && r.Url == url);

                if (savedRecipe == null)
                {
                    return NotFound("SavedRecipe not found");
                }

                // Remove shopping cart items associated with the savedRecipe
                var shoppingCartItems = await _context.ShoppingCart
                    .Where(item => item.savedRecipeId == savedRecipe.Id)
                    .ToListAsync();

                _context.ShoppingCart.RemoveRange(shoppingCartItems);
                await _context.SaveChangesAsync();
                // Remove the saved recipe
                _context.SavedRecipes.Remove(savedRecipe);

                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }




        private bool SavedRecipeExists(int id)
        {
            return (_context.SavedRecipes?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
