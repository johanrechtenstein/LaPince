BEGIN;

    INSERT INTO "user" 
        ("id","pseudo","email","password","role")
    VALUES
        (1,'admin','admin@mail.com','admin','admin'),
        (2,'bibi67','bibi67@mail.com','user','user'),
        (3,'bébère67','bbr@mail.com','user','user')
        ;

    INSERT INTO "account"
        ("id","title","user_id")
    VALUES
        (1,'papa',2),
        (2,'maman',2),
        (3,'fiston',2),
        (4,'entreprise',3)
        ;

    INSERT INTO "budget"
        ("id","title","user_id","limit","date","account_id")
    VALUES
        (1,'papa',2,200,'2025-07',1),
        (2,'maman',2,100,'2025-07',2),
        (3,'fiston',2,250,'2025-07',3),
        (4,'entreprise',3,3000,'2025-07',4)
        ;

    INSERT INTO "detail_account"
        ("id","date","amount","title","type","account_id")
    VALUES
        (1,'22/07/2025',1000,'','',1),
        (2,'20/07/2025',2000,'','',2),
        (3,'21/07/2025',3000,'','',3),
        (4,'24/07/2025',4000,'','',4)
        ;

    INSERT INTO "detail_budget"
        ("id","amount","title","date","budget_id")
    VALUES
        (1,200,'apu market','2025-07',1),
        (2,400,'shopping','2025-07',2),
        (3,300,'game Station 256','2025-07',3),
        (4,1000,'nouvelle machine','2025-07',4)
        ;

    INSERT INTO "tag"
        ("id","title","detail_account_id","detail_budget_id")
    VALUES
        (1,'salaire',1,NULL),
        (2,'nourriture',NULL,1),
        (3,'salaire',2,NULL),
        (4,'salaire',3,NULL),
        (5,'mme michu',4,NULL),
        (6,'vêtement',NULL,2),
        (7,'loisir',NULL,3),
        (8,'investissement',NULL,4)
        ;

COMMIT;



