/* = Page Structural = */
/* Animate Icons
<x asvg="fileName"/>
*/
/* Fix for height and width */
(()=>{
    let ar=document.querySelectorAll('[asvg]');
    ar.forEach((svg)=>{
        lottie.loadAnimation({
            height: 10,
            speed: 0.2,
            container: svg,
            renderer: "svg",
            loop: true,
            autoplay: false,
            path: `icons/${svg.getAttribute('asvg')}-asvg.json`
        });
    })
})()
/* //Animate Icons */