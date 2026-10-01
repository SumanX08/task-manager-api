import express from "express";
import { pool } from "./db.js";
const app=express()

app.use(express.json())

type Task={
    id:Number,
    title:string,
    description:string,
    completed:boolean
}


app.post("/api/tasks", async(req, res) => {
  try{
  const { title, description } = req.body;

  const result=await pool.query(
    `insert into tasks (title,description)
    values($1,$2) 
    returning *`,[title,description]
  )


  res.json(result.rows[0]);
}
catch(error){
  console.error(error);

    res.status(500).json({
      message: "Failed to create task",
    });
}
});

app.get("/api/tasks", async(req, res) => {
  try {

    const result=await pool.query(
      "select * from tasks order by id asc"
    ) 

    res.json(result.rows)
    
  } catch (error) {

     console.error(error);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
    
  }
});

app.get("/api/tasks/:id",async(req,res)=>{

    const id= Number(req.params.id)

    const result= await pool.query(
      "select * from tasks where id=$1",[id]
    )


    if (result.rows.length===0) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  res.json(result.rows[0]);

})

app.get("/",(req,res)=>{

    res.json({message:"Running Api"})
})

app.patch("/api/tasks/:id",async(req,res)=>{
  try{
    const id=Number(req.params.id)
      const {title,description,completed}=req.body


const result= await pool.query(
  `update tasks
  set 
  title=coalesce($1,title),
  description=coalesce($2,description),
  completed=coalesce($3,completed)
  
  where id=$4
  returning *`,[title,description,completed,id]
)
      
   
 if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(result.rows[0]);
  }
catch(error){

  console.error(error);

    res.status(500).json({
      message: "Failed to update task",
    });

}

})

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});


const PORT=5000


pool.query("SELECT NOW()")
.then((result)=>{
  console.log("Postgress Connected")
      console.log(result.rows[0]);

})
.catch((error)=>{
  console.error("Poostgress error",error)
})
app.listen(PORT,()=>{
      console.log(`Server running on http://localhost:${PORT}`);

})