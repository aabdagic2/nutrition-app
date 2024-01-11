using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using recipeappAPI.Data;
using recipeappAPI.Models;

namespace recipeappAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShoppingCartsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ShoppingCartsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ShoppingCarts
       
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShoppingCart>>> GetShoppingCartForRecipe(string recipeUrl, string userId)
        {
            // Check if the recipe is saved
            var savedRecipe = await _context.SavedRecipes.FirstOrDefaultAsync(r => r.Url == recipeUrl && r.userId == userId);

            if (savedRecipe == null)
            {
                // Recipe is not saved, return null or an appropriate response
                return Ok(); // You can modify this based on your needs
            }

            // Recipe is saved, retrieve shopping cart items
            var shoppingCartItems = await _context.ShoppingCart
                .Where(item => item.savedRecipeId == savedRecipe.Id)
                .ToListAsync();

            return Ok(shoppingCartItems);
        }




        // PUT: api/ShoppingCarts/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutShoppingCart(int id, ShoppingCart shoppingCart)
        {
            if (id != shoppingCart.Id)
            {
                return BadRequest();
            }

            _context.Entry(shoppingCart).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ShoppingCartExists(id))
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

        // POST: api/ShoppingCarts
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Route("AddToShoppingCart")]
        public async Task<ActionResult<ShoppingCart>> AddToShoppingCart([FromBody] AddToShoppingCartModel model)
        {
            var recipe = model.Recipe;
            var cartItem = model.CartItem;

            if (recipe == null)
            {
                return BadRequest("Invalid recipe data.");
            }

            var existingRecipe = await _context.SavedRecipes.FirstOrDefaultAsync(r => r.Url == recipe.Url);

            if (existingRecipe == null)
            {
                // The recipe doesn't exist in the SavedRecipes, so add it.
                _context.SavedRecipes.Add(recipe);
                await _context.SaveChangesAsync();

                // Retrieve the newly created recipe with its ID.
                existingRecipe = await _context.SavedRecipes.FirstOrDefaultAsync(r => r.Url == recipe.Url);
            }

            if (cartItem == null)
            {
                return BadRequest("Invalid shopping cart item data.");
            }

            // Assign the saved recipe's ID to the shopping cart item.
            cartItem.savedRecipeId = existingRecipe.Id;

            // Add the shopping cart item to the ShoppingCart.
            _context.ShoppingCart.Add(cartItem);
            await _context.SaveChangesAsync();

            // Return the shopping cart item with the saved recipe's ID.
            return Ok(cartItem);
        }



        // DELETE: api/ShoppingCarts/5
        [HttpDelete]
        public async Task<IActionResult> DeleteShoppingCart([FromQuery] int SavedId, [FromQuery]string food)
        {
            if (_context.ShoppingCart == null)
            {
                return NotFound();
            }
            var shoppingCart =  await _context.ShoppingCart
        .FirstOrDefaultAsync(item => item.savedRecipeId == SavedId && item.food == food);
            if (shoppingCart == null)
            {
                return NotFound();
            }

            _context.ShoppingCart.Remove(shoppingCart);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ShoppingCartExists(int id)
        {
            return (_context.ShoppingCart?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
