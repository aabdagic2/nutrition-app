import { Component, OnInit } from '@angular/core';
import {RecipesService} from '../recipes.service'
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'saved-recipes-list',
  templateUrl: './saved-recipes-list.component.html',
  styleUrls: ['./saved-recipes-list.component.css']
})

export class SavedRecipesComponent implements OnInit {
  savedRecipes:{ title: string; image: string; dietLabels: string[]; recipeUrl:string;servings:number,time:number,calories:number, cart: {
    food: string,
    savedRecipeId: number
  }[] }[]=[];
  searchTerm:string='';
  recs:{ title: string; image: string; dietLabels: string[]; recipeUrl:string;servings:number,time:number,calories:number, cart: {
    food: string,
    savedRecipeId: number
  }[] }[]=[];
  constructor(private recipeService: RecipesService,private cookieService:CookieService,private http:HttpClient) { }

  async ngOnInit() {
    let s:any = await this.recipeService.getSavedRecipes();
    //s.reverse();
    s.forEach(async (recipe:any)=>{
      console.log(recipe)
      const res:any=await this.http.get('https://localhost:7178/api/ShoppingCarts?recipeUrl='+recipe.recipeUrl+'&userId='+this.cookieService.get('user')).toPromise()
      let cart:any=[]
      if(res)
      res.forEach((result:any)=>{
       cart.push({
          food: result.food,
          savedRecipeId: result.savedRecipeId
        });
      });
      console.log(cart)
      this.savedRecipes.push({ title: recipe.title, image: recipe.image, dietLabels: recipe.dietLabels, recipeUrl:recipe.recipeUrl,servings:recipe.servings,time:recipe.time,calories:recipe.calories, cart: cart }) ;
    })
   this.recs=this.savedRecipes;
  }
  async updateItems() {
   
      this.savedRecipes=this.recs
  
      // Use Array.prototype.filter to filter the recipes locally
      
      const filteredRecipes = this.savedRecipes.filter((recipe: any) => {
        // Adjust the conditions based on your search criteria
        return (
          recipe.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          // Add other conditions as needed
          recipe.dietLabels.some((label: string) => label.toLowerCase().includes(this.searchTerm.toLowerCase()))
        );
      });
  
      this.savedRecipes = filteredRecipes;
    
  }
  
 async deleteShoppingItem(item: any, recipe1: any) {
  try {
    // Remove the item from the shopping cart in the database
    await this.http.delete(`https://localhost:7178/api/ShoppingCarts?SavedId=${item.savedRecipeId}&food=${item.food}`).toPromise();
    console.log("xxx")
    console.log(recipe1)
    console.log("xxx")
    // Find the index of the recipe in savedRecipes
    const index = this.savedRecipes.findIndex((i: any) => i.recipeUrl === recipe1.recipeUrl);
    console.log(this.savedRecipes[index])
    // Find the index of the item in the recipe's cart
    const cartIndex = this.savedRecipes[index].cart.findIndex((i: any) => i.food === item.food);
    console.log(cartIndex)
    // Remove the item from the local cart array
    this.savedRecipes[index].cart.splice(cartIndex, 1);
  } catch (error) {
    console.error(error);
    // Handle errors as needed
  }
}

 async toggleSaveRecipe(recipe:{ title: string; image: string; dietLabels: string[]; recipeUrl:string;servings:number,time:number,calories:number }){
  
    const res: any=await this.http.delete('https://localhost:7178/api/SavedRecipes?userId='+this.cookieService.get('user')+'&url='+recipe.recipeUrl).toPromise();
    console.log(res);
    const indexToRemove = this.savedRecipes.findIndex(savedRecipe => savedRecipe.recipeUrl === recipe.recipeUrl);
  if (indexToRemove !== -1) {
    this.savedRecipes.splice(indexToRemove, 1);
  }
    }
  getStarRatingArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starRatingArray = Array(5).fill(0);

    for (let i = 0; i < fullStars; i++) {
      starRatingArray[i] = 1;
    }

    if (hasHalfStar) {
      starRatingArray[fullStars] = 0.5;
    }
    return starRatingArray;
  }
}