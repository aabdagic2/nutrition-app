import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { Observable, of,from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class RecipesService implements OnInit{

  recipes = [
    { id: 1, title: 'Spaghetti Bolognese', image: 'https://www.rd.com/wp-content/uploads/2020/11/RD-americas-favorite-foods-FT-Getty-Images-7-JValentine.jpg', description: 'Classic Italian pasta dish with tomato sauce and ground beef.',rating:3.1 },
    { id: 2, title: 'Chicken Curry', image: 'https://www.rd.com/wp-content/uploads/2020/11/RD-americas-favorite-foods-FT-Getty-Images-7-JValentine.jpg', description: 'Spicy Indian curry with chicken and vegetables.',rating:4.5 },
    { id: 3, title: 'Caesar Salad', image: 'https://www.rd.com/wp-content/uploads/2020/11/RD-americas-favorite-foods-FT-Getty-Images-7-JValentine.jpg', description: 'Crisp romaine lettuce with parmesan cheese and croutons.',rating:4.0 },
    { id: 4, title: 'Beef Stroganoff', image: 'https://www.rd.com/wp-content/uploads/2020/11/RD-americas-favorite-foods-FT-Getty-Images-7-JValentine.jpg', description: 'Russian dish with sautéed beef and sour cream sauce.',rating:2.5 }
    ,{ id: 5, title: 'Spaghetti Bolognese', image: 'https://www.rd.com/wp-content/uploads/2020/11/RD-americas-favorite-foods-FT-Getty-Images-7-JValentine.jpg', description: 'Classic Italian pasta dish with tomato sauce and ground beef.',rating:4.7 },
    { id: 6, title: 'Chicken Curry', image: 'https://www.rd.com/wp-content/uploads/2020/11/RD-americas-favorite-foods-FT-Getty-Images-7-JValentine.jpg', description: 'Spicy Indian curry with chicken and vegetables.',rating:3.7 },
    { id: 7, title: 'Caesar Salad', image: 'https://www.rd.com/wp-content/uploads/2020/11/RD-americas-favorite-foods-FT-Getty-Images-7-JValentine.jpg', description: 'Crisp romaine lettuce with parmesan cheese and croutons.',rating:5 },
    
  ];
  savedRecipes = [
    { id: 1, title: 'Spaghetti Bolognese', image: 'https://www.rd.com/wp-content/uploads/2020/11/RD-americas-favorite-foods-FT-Getty-Images-7-JValentine.jpg', description: 'Classic Italian pasta dish with tomato sauce and ground beef.',rating:3.1 },
    { id: 2, title: 'Chicken Curry', image: 'https://www.rd.com/wp-content/uploads/2020/11/RD-americas-favorite-foods-FT-Getty-Images-7-JValentine.jpg', description: 'Spicy Indian curry with chicken and vegetables.',rating:4.5 },
    { id: 3, title: 'Caesar Salad', image: 'https://www.rd.com/wp-content/uploads/2020/11/RD-americas-favorite-foods-FT-Getty-Images-7-JValentine.jpg', description: 'Crisp romaine lettuce with parmesan cheese and croutons.',rating:4.0 }
  ];
  constructor(private http: HttpClient,private cookieService:CookieService) {}
  ngOnInit(): void {
   
  }
async getTodayCalories(): Promise<{name:string,calories:number,
image:string,description:string,rating:number}[]>{
  try {
    const response = await this.http.get<any>('https://localhost:7178/api/todaycalories/get').toPromise();
    const rec: {name:string,calories:number,
      image:string,description:string,rating:number}[] = [];
console.log(response);
    response.forEach(async (hit: any) => {

      const label: string = hit.name;
      const image: string = hit.image;
      let description: string = hit.description;
      const img= await this.getRecipe(label);
      rec.push({ name: label,calories:Number(hit.calories), image: img[0].image, description: description, rating: Number(hit.rating) });
    });

    return rec; 
  } catch (error) {
    console.error(error);
    return [];
  }
}
  async getRecipes(): Promise<{ title: string; image: string; description: string; calories: number;dietLabels: string[],saved: boolean,source:string; url:string; servings:number; time:number,healthLabels:string[] }[]> {
    try {
      const response = await this.http.get<any>('https://localhost:7178/api/recipes/Get').toPromise();
      const hits = response["hits"];
      const rec: {  title: string; image: string; description: string; calories: number;dietLabels:string[];saved:boolean;source:string; url:string; servings:number; time:number,healthLabels:string[] }[] = [];

      hits.forEach((hit: any) => {
        const recipe = hit.recipe;

        const label: string = recipe.label;
        const image: string = recipe.image;
        const source: string = recipe.source;
        const url: string = recipe.url;
        let description: string = Number(recipe.calories).toString() + ", ";

        recipe.dietLabels.forEach((element: string) => {
          description += element+"kcal , ";
        });

        rec.push({ title: label, image: image, description: description, calories: Math.round(recipe.calories / recipe.yield),dietLabels: recipe.dietLabels,saved:false,source:source,url:url,servings:recipe.yield, time:recipe.totalTime,healthLabels:recipe.healthLabels });
      });

      return rec;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getRecipe(name: string | null): Promise<{
    title: string;
    image: string;
    description: string;
    calories: number;
    dietLabels: string[];
    saved: boolean;
    url: string;
    servings: number;
    time: number;
    totalNutrients: any;
    ingredients: string[];
    source: string;
    healthLabels: string[];
  }[]> {
    try {
      const response = await this.http.get<any>('https://localhost:7178/api/recipes/GetRecipeByName/' + name).toPromise();
      const hits = response["hits"];
        
      const rec: {
        title: string;
        image: string;
        description: string;
        calories: number;
        dietLabels: string[];
        saved: boolean;
        url: string;
        servings: number;
        time: number;
        totalNutrients: any;
        ingredients: string[];
        source: string;
        healthLabels: string[];
      }[] = [];
  
      const recipe = hits[0].recipe;
      console.log(recipe)
  
      const label: string = recipe.label;
      const image: string = recipe.image;
      const source: string = recipe.source;
      const url: string = recipe.url;
      const healthLabels: string[] = recipe.healthLabels;
      let description: string = Number(recipe.calories).toString() + ", ";
      const uniqueIngredients: Set<string> = new Set();
      const ingredientss: {
        text: string;
        quantity: 0;
        measure: string;
        isInCart: boolean;
      }[] = [];
     let ingr:string[]=[];
      if (recipe.ingredients) {
        ingr=[];
        const elements: any[] = [];
        console.log(ingr)
        for(let i=0;i<recipe.ingredients.length;i++){
            ingr.push(recipe.ingredients[i].text
            );
       
            console.log(ingr);
     }
      
      
      }
  
   
  
    
  
    let  rec1={
        title: label,
        image: image,
        description: description,
        calories: Math.round(recipe.calories / recipe.yield),
        dietLabels: recipe.dietLabels,
        saved: false,
        url: recipe.url,
        servings: recipe.yield,
        time: recipe.totalTime,
        totalNutrients: recipe.totalNutrients,
        ingredients: ingr,
        source:source,
        healthLabels:healthLabels,
      };
      console.log(rec1)
      let r=[]
      r.push(rec1);
      return r;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  
  async getSavedRecipes():Promise<{ title: string; image: string; dietLabels: string[]; recipeUrl:string;servings:number,time:number,calories:number }[] >{
    const response = await this.http.get<any>('https://localhost:7178/api/SavedRecipes?userId='+this.cookieService.get('user')).toPromise();
    const hits = response["hits"];
    const rec: {  title: string; image: string; dietLabels: string[]; recipeUrl:string;servings:number,time:number,calories:number }[] = [];
    response.forEach(async (hit: any) => {
      console.log(hit);
      const label: string = hit.title;
      const image: string = hit.profileImage;
      let dietLabels: string[] = [];
      
      rec.push({ title: label, image: image, dietLabels: hit.dietLabels.split('/').map((label:any) => label.trim()), recipeUrl:hit.url,servings:hit.servings,time:hit.time,calories:hit.calories  });
    });
    return rec;
   }
    getRecipesFilter(): Observable<{ title: string; image: string; description: string; calories: number;dietLabels: string[],saved: boolean,source:string; url:string; servings:number; time:number }[]> {
    const rec=this.getRecipes()
    return from(rec);
  }

  getRecipesByDiet(diet: string): Observable<{ title: string; image: string; description: string; calories: number; dietLabels: string[]; saved: boolean; source: string; url: string; servings: number; time: number,healthLabrls:string[] }[]> {
    const apiUrl = `https://localhost:7178/api/recipes/GetByDiet/${diet}`;

    return this.http.get(apiUrl).pipe(
      map((response: any) => {
        const hits = response.hits;
        return hits.map((hit: any) => {
          const recipe = hit.recipe;

          const label = recipe.label;
          const image = recipe.image;
          const source = recipe.source;
          const url = recipe.url;
          let description = Number(recipe.calories).toString() + ', ';

          recipe.dietLabels.forEach((element: string) => {
            description += element + 'kcal , ';
          });

          return {
            title: label,
            image: image,
            description: description,
            calories: Math.round(recipe.calories / recipe.yield),
            dietLabels: recipe.dietLabels,
            saved: false,
            source: source,
            url: url,
            servings: recipe.yield,
            time: recipe.totalTime,
            healthLabels:recipe.healthLabels
          };
        });
      }),
      catchError((error) => {
        console.error(error);
        return [];
      })
    );
  }
  async getFilteredRecipes(name:string|null): Promise<{ title: string; image: string; description: string; calories: number;dietLabels:string[];saved:boolean; url:string;servings:number; time:number;totalNutrients:any; ingredients:{
    text: string,
    quantity: 0,
    measure: string,isInCart:boolean}[],source: string,healthLabels:string[] }[]> {
    try {
      const response = await this.http.get<any>('https://localhost:7178/api/recipes/GetRecipeByName/'+name).toPromise();
      const hits = response["hits"];
      const rec: {  title: string; image: string; description: string; calories: number;dietLabels:string[],saved:boolean,url:string, servings:number, time:number,totalNutrients:any; ingredients:{
        text: string,
        quantity: 0,
        measure: string, isInCart: boolean}[],source: string, healthLabels:string[] }[] = [];
      hits.forEach((hit: any) => {
        const recipe = hit.recipe;
         console.log(recipe.totalNutrients)
        const label: string = recipe.label;
        const image: string = recipe.image;
        const source: string = recipe.source;
        const url: string = recipe.url;
        const healthLabels: string[]=recipe.healthLabels;
        let description: string = Number(recipe.calories).toString() + ", ";
        const ingredients:{
            text: string,
            quantity: 0,
            measure: string, isInCart: boolean}[]=[];
            recipe.ingredients.forEach((element:  {
              text: string,
              quantity: 0,
              measure: string,
              food: string,
              weight: 0,
              foodId: string
            })=>{
              ingredients.push({text:element.text,quantity:element.quantity, measure: element.measure,isInCart: false})
            });
           var instructions: string[]=[];
           if(recipe.instructions!=undefined)
           recipe.instructions.forEach((element:string)=>{instructions.push(element);});
          
      

        rec.push({ title: label, image: image, description: description, calories: Math.round(recipe.calories/recipe.yield),dietLabels: recipe.dietLabels,saved:false, url:recipe.url, servings:recipe.yield, time:recipe.totalTime,totalNutrients: recipe.totalNutrients,ingredients,source,healthLabels });
      });

      return rec;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  getRecipesByHealth(healthTags: string[],dietTags:string[],searchTerm:string,minCalories:number=-Infinity,maxCalories:number=Infinity): Observable<{ title: string; image: string; description: string; calories: number; dietLabels: string[]; saved: boolean; source: string; url: string; servings: number; time: number,healthLabels:string[] }[]> {
    
    var apiUrl = `https://api.edamam.com/api/recipes/v2?type=public&app_id=89c68f46&app_key=41fb7f41e7818b87c557110853921ded`;
    if(searchTerm.length!=0){
      apiUrl+='&q='+searchTerm;
    }
dietTags.forEach(element => {
  apiUrl += '&diet='+element.toLowerCase();
});
healthTags.forEach(element => {
  apiUrl += '&health='+element.toLowerCase();
});
if(minCalories!=-Infinity&&maxCalories!=Infinity){
  apiUrl+='&calories='+minCalories.toString()+'-'+maxCalories.toString();
}
    return this.http.get(apiUrl).pipe(
      map((response: any) => {
        const hits = response.hits;
        return hits.map((hit: any) => {
          const recipe = hit.recipe;

          const label = recipe.label;
          const image = recipe.image;
          const source = recipe.source;
          const url = recipe.url;
          let description = Number(recipe.calories).toString() + ', ';

          recipe.dietLabels.forEach((element: string) => {
            description += element + 'kcal , ';
          });

          return {
            title: label,
            image: image,
            description: description,
            calories: Math.round(recipe.calories / recipe.yield),
            dietLabels: recipe.dietLabels,
            saved: false,
            source: source,
            url: url,
            servings: recipe.yield,
            time: recipe.totalTime,
            healthLabels:recipe.healthLabels
          };
        });
      }),
      catchError((error) => {
        console.error(error);
        return [];
      })
    );
  }
   async rateRecipe(){

   }
   

}
