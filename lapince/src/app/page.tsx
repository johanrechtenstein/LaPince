import Image from "next/image";
import './styles/globals.css';



export default function Home(){
    return <div>
        

    <div className=" p-4 flex flex-col "> 
      <div className="justify-items-center p-4">   
        <h1 className="text-7xl font-bold text-blue-700 ">La Pince</h1>
        <h2>Ne gagnez pas <strong>Plus</strong>, dépenser <strong>Moins</strong>.</h2>
      </div>
      <div className="text-center">
        <p>
        Le site "La Pince" a été créé en se basant sur la technologie NextJS et tailwind afin de les découvrir. Il est à la base pour un but pédagogique mais avec l'intention de le déployer pour en faire profiter. Pour se faire, vous avez la possibilité de créer plusieurs "porte-feuilles" afin de pouvoir gérer chaque membre de la famille sans passer par de multiples comptes utilisateurs avec les recettes(exemple de saisie: 100) et les dépenses ( exemple: -100, ne pas oublier le signe avant), et un système de budgets, basé sur la mode " des enveloppes".Vous fixer une limite qui correspond à la somme que vous voulez retirer ou garder de côté pour un budget(celle-ci est retiré du montant total de votre porte-feuille), et après dans ce budget vous pourrez y ajouter petit à petit vos dépenses prévus pour cette enveloppe.

        En espérant que celà puisse vous aider.
        </p>
      </div>
    </div>
    
    <Image className="m-auto" src="/crabe.webp"
           width={250}
           height={250}
           alt="image d'un crabe avec de l'argent dans une pince" />
    </div>
    
}