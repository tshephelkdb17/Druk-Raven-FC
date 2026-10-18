import {test,expect} from '@playwright/test';
test('desktop navigation, grouping, profile and four-column TV grid',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/squad');
 await expect(page.getByRole('heading',{name:'Behind the badge.'})).toBeVisible();
 if(process.env.DRFC_QA)await page.screenshot({path:'/tmp/drfc-squad-desktop.png',fullPage:true});
 for(const name of ['Goalkeepers','Defenders','Midfielders','Forwards','Staff & management']) await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Open Squad menu'}).click();
 await expect(page.locator('#mega-menu')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#mega-menu')).toHaveCount(0);
 await page.locator('a[href="/squad/player-17"]').click();
 await page.waitForURL('**/squad/player-17');
 await expect(page.getByRole('heading',{name:'Player 17',level:1})).toBeVisible();
 await expect(page.getByText(/Photo \d · Coming soon/)).toHaveCount(3);
 await page.goto('/tv');
 if(process.env.DRFC_QA)await page.screenshot({path:'/tmp/drfc-tv-desktop.png',fullPage:true});
 const columns=await page.getByTestId('video-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);expect(columns).toBe(4);
 await page.getByRole('button',{name:'TRAINING',exact:true}).click();await expect(page.getByRole('status')).toContainText('No films');
 await page.getByRole('button',{name:'ALL',exact:true}).click();await expect(page.getByRole('heading',{name:'From the touchline'})).toBeVisible();
});
test('mobile fits viewport and retains two-column video grid',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/tv');
 if(process.env.DRFC_QA)await page.screenshot({path:'/tmp/drfc-tv-mobile.png',fullPage:true});
 expect(await page.getByTestId('video-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Open navigation'}).click();await expect(page.locator('#mobile-menu')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('#mobile-menu')).toHaveCount(0);
 for(const path of ['/','/squad','/squad/player-17','/admin']){await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),path).toBe(true)}
});
test('hero respects reduced motion and pauses when scrolled away',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 if(process.env.DRFC_QA)await page.screenshot({path:'/tmp/drfc-home-desktop.png',fullPage:true});
 const video=page.locator('video');await expect(video).toBeVisible();expect(await video.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);

 await page.getByRole('button',{name:'Play video',exact:true}).click();await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(false);
 await page.locator('footer').scrollIntoViewIfNeeded();await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.paused)).toBe(true);
});
test('demo never permits admin writes',async({request})=>{
 const response=await request.post('/api/admin/videos',{data:{title:'Unauthorised'}});expect(response.status()).toBe(503);
 expect((await response.json()).error).toContain('disabled');
});
