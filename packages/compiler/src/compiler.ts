import { parse } from './parser';
import { evaluateExpression, interpolateTemplate, RuntimeScope } from './expression';
import { browserRuntime } from './runtime';
import { ComponentNode, ElementNode, ForNode, IfNode, ProgramNode, PropertyNode, UINode } from './ast';

const KATTOUR_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAFAGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA4LTAxPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPmMyMjhlZDc5LWEyODUtNDg2MC05MWMyLTYyZDVhNjNhNGNkMTwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5LYVRUT1VSIC0gMjwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6cGRmPSdodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvJz4KICA8cGRmOkF1dGhvcj5wZDZicG40NjgyPC9wZGY6QXV0aG9yPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczp4bXA9J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8nPgogIDx4bXA6Q3JlYXRvclRvb2w+Q2FudmEgKFJlbmRlcmVyKSBkb2M9REFHdXg5R0VqYm8gdXNlcj1VQUU1YWdpbzd3RSBicmFuZD1CQUU1YWgtdzdpOCB0ZW1wbGF0ZT1CbGFjayBhbmQgV2hpdGUgTWluaW1hbGlzdCBNb25vY2hyb21lIExldHRlciBLIFByb2Zlc3Npb25hbCBCdXNpbmVzcyBTYWxvbiBMb2dvPC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlwdGlvbj4KPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/PgSx0U8AAE5iSURBVHic7N3vy93Vne7x93U4D/wxjk46OsooyqSgHCkoqCVJNVGjnZiU2DAJimECCcoY9IGMTo/tdNSO7XSq5yAoBioJjhgU449E6+8YE41JM4oTkICCioEIkUgkGmKeXefB2s5JW/W+93fvfX/2+n4/r39gX2SmXvda37XWR6SUqmD7ROAl4JzoLANYJWlldIiJ2P4HYFV0jgH8FzBH0udRAWw/Cfw46vcD7AP+l6RPowL8j6gfTilNnu3pwJvUXeY/qaTMf0bdZb6TLPOptg+4KLLMART54ymlidk+D3gRmBadZQBLJK2LDjER2/cCN0TnGMCbwNws8ym1H5gl6d3oIP8zOkBK6ZvZngs8AxwVnaWhA8BCSVuig0zE9oPAsugcA9gG/FDSwagAHSzzA5TdkPAyhyz0lMaW7WuAh6NzDGAPZbX4XnSQidh+BlgQnWMA2yj/1l9GBbD9O2B+1O8HOAhcIumd6CBfyW/oKY0h2/9M3WW+Czh/3Mvc9tG2N1F3mW8my3yqHaT8m78dHeRI+Q09pTFjezWwPDrHADYCiyR9ER3k29g+gXI24YLoLAPYLOniyAAdLPNDlJX5juggfyy33FMaI7afA+ZF5xjAWklLo0NMxPZJwBbgrOgsA3hZ0uWRATpY5ocp5xTGrswht9xTGgu2j7e9jbrL/BeVlPlpwA7qLvNnx6DMX6JbZQ4wX9LW6BDfJFfoKQWzfSplm/rM6CwDWCFpTXSIidg+C9gEnBKdZQDPSgr95t8r88siMwSYJ2lTdIhvk9/QUwpk+0zKoaaTg6M0dYhyLW1jdJCJ2D6XUuYnRGcZwFOSFkUG6HCZvxAdYiK55Z5SENszKFu/tZb5PsqDGjWU+SzgdbLMB9LRMl9YQ5lDFnpKIWwvpNwdPj46S0PvUa6l7YwOMhHblwNbgWOjswzg0SzzEIslPR0dYrKy0FOaYravB9ZH5xjAduD7knZHB5mI7asoV9Nq9pCkqyMD2H6Vbpb549Eh+pGFntIUsv0r4P7oHAPYIGmmpAPRQSZi+1rgkegcA3pIUuhztL0ynxOZIcDS2socstBTmjK2HwZujc4xgP8r6croEJNh+1+A30bnGNADWeYhVkhaGx2iiby2ltKI2T4G2ADMjc4ygJWSqhgp2oKJaVDK/LqoH7d9NPAc3SvzlTVcv/wmeW0tpRGyPQ14hbrnmF8paUN0iMmw/QhwVXSOAd0n6caoH++V+UZgZlSGINX80fpNcoWe0ojYPp1S5tOjszS0H1ggaXt0kMlowcQ0gLsl3RL14x0u85tqL3PIQk9pJGyfA7wEnBidpaHdwKWSPogOMhHbx1JmxocOKRmCLPMYP5d0T3SIYchDcSkNme25wBvUW+Y7KXfMayjzEygPxtRe5rdnmYf4taQ7o0MMSxZ6SkNkezHwMnBMdJaGnqe8/rYvOshEehPTtgPnRmcZ0C2S7oj6cdt/RjfL/B5JNd86+RNZ6CkNie1/Ah6LzjGANZKukHQoOshEbJ9B/RPToJT53VE/3ivzTXSvzFdJuik6xLDlKfeUhsD2/cD10TkG8DNJv4oOMRm9iWlbgJOiswzoRkn3Rf34EWV+flSGIKskrYwOMQpZ6CkNyPZ6YGF0jgEsreUhjZZMTAO4TtIDUT/e4TJfI2lFdIhRyUJPqSHbx1FOV8+OztLQF8CPJG2JDjIZti+m/HvXPGQFssyjrJW0NDrEKGWhp9SA7ZMpB4nOjs7S0F5grqRd0UEmw/YCSpnXbpmkh6J+3PafU/7/tmtl/rikxdEhRi0PxaXUJ9tnAm9Sb5nvolxLq6XMr6IdZX71GJT5FrLMWysLPaU+2D6Pcrr61OgsDW0BZkjaEx1kMmzfQP0T06CU+aNRP35Emdf8BHETT3elzCELPaVJsz2P8ojJ8dFZGlonaY6kL6KDTIbtO4B7o3MMwaIs8xAvSKr5sGrfstBTmgTbyynTp46KztLQv0laEh1ismz/FviX6BxDsEjSU1E/bvsv6G6Zz4sOMdXyUFxKE7B9O3BbdI4BrKhpJGRLJqZBGWzzbNSP98r8deo969HUJkmXRoeIkMNZUvoWtlcDy6NzNHSYskJ8PjrIZLVkYhrA5ZJejvrxDpf5VmB+dIgouUJP6WvYPgp4Eqh1224fcIWkt6KDTEZvYtqLwKzoLEOQZR5jB3BJDU8Xj0qu0FP6I7anUcrlvOgsDX1AGX26OzrIZPQmpm2i/iErABdL2hz14x0v87ldLnPIQ3Ep/QHbpwL/Sb1l/hZwQUVlfgrtmJj2JfFl/pd0s8zfppT5wegg0bLQU+qxfTblwZjp0Vka2gBcKGl/dJDJaNHEtIOUQtkcFaBX5lvpXpm/Q9lm73yZQxZ6SgDYnk1ZKZ4cnaWhVZKulHQ4Oshk9Cam7QBOi84yoIOUQtkWFeCIMj8zKkOQd4E5kg5EBxkXWeip82wvBjYDxwVHaermmsZB2r6A8sdT7eNPP6eU+ZtRATpe5hfVshs1VfKUe+o029cD90fnGMASSeuiQ0xWb2Las8DR0VkG9DkwW9LOqAC2/4ryaEzXyvx9YKakfdFBxk0Weuos23cBN0fnaOgAME/S9uggk9WiiWmfUVbm0WW+DfibqAxBPqLMItgbHWQc5bW11Em2HwNqHdqwh3II673oIJNlexnwYHSOIfiU8t02bFJdx8v8wizzb5Yr9NQpto+hvMk+OzpLQzspK/Nq/qPWm5jWhiErnwI/iPxDqsNlvoeKpgRGyUNxqTNsnwi8Qb1lvhGYVVmZ30k7yvwTssyj7KWszLPMJ5Bb7qkTbE8HXgFOj87S0FpJS6ND9KM3Me3a6BxD8AnlENaHUQFs/zXwGt0r832UMv8oOkgNcoWeWs/2eZTX32ot89srLPMnaEeZf8x4lPkbdLPML5L0fnSQWuQ39NRqtudSTlbXOsd8qaS10SH6YftF4PLoHEOwm3I1LewZ3SPKvNY/RpvaT/m89G50kJrklntqLdvXAA9H52joELBQ0sboIJNl+zjgedoxMW03pVA+jgrQ4TI/QLlJkGXep9xyT61k+2fUW+Z7KWVSU5l/h1I+bSjzD4kv89PpZpl/9ZTuO9FBapQr9NQ6tlcDy6NzNPQe5Y55NSd6exPTXgO+G51lCD6kfDP/JCrAEWX+11EZgnw15Obt6CC1ym/oqVVsrwcWRudoaDvljnk1wyZ6E9Neo/4hK1D+mJqdZR7iEGVlviM6SM1yyz21gu3jbW+j3jJfJ2lmZWX+PdoxMQ1gF+WeeZb51DsM/DDLfHBZ6Kl6tk+lFMuM6CwN3SVpSXSIfvQmpr1B/RPToJT5hZI+jQrQ8TKfL2lrdJA2yC33VDXbZ1JGn9Y6x3ylpFXRIfrRoolpUJ7SvUTSZ1EBbP8N5bNF18oc4FJJm6JDtEUeikvVsj2Dck3q+OgsDRwGrpK0ITpIP2wvAp6IzjEkOynfzD+PCtAr823AX0VlCDQvy3y4css9Vcn2Qsp/CGss8/2ULd7aynwZ7SnzN8kyj7RQ0gvRIdomCz1Vx/ZyYH10joZ2AxdIeis6SD96E9MejM4xJNso2+xZ5jEWS3o6OkQbZaGnqtj+JbA6OkdDbwHnS/ogOkg/bP8b7ZiYBqVE50o6GBWgd+6jy2X+eHSItspv6Kkath8GronO0dDzwCJJh6OD9MP2g8Cy6BxDshm4QtKXUQF6Zb4V+MuoDIGWZpmPVhZ6Gnu2jwE2AHOjszS0RtKK6BD96k1MWxSdY0g2S7o4MkDHy3xFbUOGapRb7mms2Z5GuZ9ba5n/79rK3PbRvYlpbSnzl7PMQ62UtCY6RBfkPfQ0tnqPbbwCTI/O0tASSeuiQ/SjNzFtI3BBdJYheVbSgsgAWeZ1vbNQs9xyT2PJ9jnAS8CJ0Vka+AL4kaQt0UH60ZuY9irwvegsQzIOZX425dt9F8v8pizzqZVb7mns2J5N2Wavscz3ADMqLPPTgN/TnjJ/akzK/HW6Wea3SronOkTXZKGnsWJ7MWVFc0xwlCZ2Ua6l7YoO0g/b36W8hd+G8adQyjz0+/8RZf4XkTmC/ELSr6NDdFEWehobtm8BHovO0dAWysp8b3SQfvQmpv0eOCU6y5A8mmUe6h5Jt0WH6Kos9DQWbN8P/CY6R0NrJc2R9EV0kH7YnkX5tPGd6CxD8pCkqyMD9M5+dLXMV0m6KTpEl2Whp3C21wPXR+do6E5JS6ND9Mv25ZST18dFZxmShySFPoDTK/MtdLfMV0aH6Lq8tpbC9K5IPQPMjs7S0Ioa79e2bGIawAOSrosMcESZ/3lkjiBVPpzURlnoKYTtkyn3nc+OztLAIeDvJD0fHaRfvYlpD0bnGKIs81hra9yhaqvcck9TzvZ0yvjKGst8HzCr0jK/lXaV+X1Z5qGyzMdMrtDTlLJ9HvAiMC06SwMfAJdK2h0dpF+27wVuiM4xRHdLuiUygO3zKbtMXSzzxyUtjg6R/lAWepoytucBTwJHRWdpYDuwQNL+6CD9atnENBifMt8E/FlkjiBPS1oYHSL9qdxyT1PC9nLgOeos8w2SZlZa5k/QrjK/Pcs81AtZ5uMrCz2NnO3bgdXRORpaJenK6BD96k1M20R7JqYB3CLpjsgAWeaaFx0ifbPcck8jZXs1sDw6R0M31fgedQsnpkEp87sjA9ieSTn/0cUy3yTp0ugQ6dvltLU0EraPonwvr/Uv+islbYgO0S/bJ1HKvC1DVgBulHRfZIBemW8Ejo7MEWQrMD86RJpYrtDT0NmeRlnJnBedpYH9lMNv26OD9Ks3Me014IzgKMN0naQHIgN0vMx3AJdIOhQdJE0sV+hpqGyfSpmWNj04ShO7KdfSPogO0q/exLTXaM+QFcgyj7YDmJtlXo88FJeGpjdl6k3qLPOdlNGnNZb5ubRrYhrAsizzUG9TyvxgdJA0eVnoaShsz6bc1T45OksDz1Nef9sXHaRfvYlpr9OeiWlQyvyhyAC259DdMn+Hss2eZV6ZLPQ0MNsLKdvsNU7uWiPpihq3FY+YmHZsdJYhunpMyvxVulvmcyQdiA6S+peFngZi+3pgfXSOhn5e65Qo21dRDh62ySJJj0YGOKLMu+hdSplX94BSKvKUe2rM9m+A0Fe7BrBU0troEE3Yvhb4bXSOIVsk6anIAB0v8/eBmTV+dkr/XxZ6asT2Y0CNwxm+AH4kaUt0kCZs/zPwr9E5hmyBpGcjA9i+DHgpMkOgj4AZkvZGB0mDyWtrqS+2j6G8yT47OksDeyknd3dFB2mihRPTIMs82kfAhVnm7ZAr9DRptk+k/IfvnOgsDewC/lbSnuggTdh+BLgqOseQXS7p5cgAHS/zPZSVeZX/m0h/Kgs9TYrt6cArwOnRWRrYQtlm/yI6SBO2nwEWROcYsoslbY4M0PEy30sp84+ig6ThyVPuaUK2zwH+kzrLfJ2kOTWW+RET09pU5l+SZR5tH2Wb/aPoIGm4stDTt7I9F3gDmBadpYF/l7QkOkQTtk+g3O2/ODjKMH1JOcOwOTKE7fl0u8wvkvR+dJA0fLnlnr6R7WuAh6NzNLRC0proEE30JqZtAc6KzjJEB4EfStoWGaJX5r+LzBBoP+VFxHejg6TRyBV6+lq2f0qdZX4YuKLiMj+NMhSjTWX+OeUp0SzzOAcoj8ZkmbdYXltLf8L2amB5dI4G9lHK/K3oIE3YPgvYRLuGrHwOzJa0MzJEljmXSHonOkgardxyT3/A9npgYXSOBj6gjD7dHR2kid7EtE3ACdFZhugzSpFkmcc5SPmD6u3oIGn0css9AWD7eNvbqLPM3wIuqLjMv5qY1qYy/5Rykjq6zH9Md8v8EOUQYpZ5R2ShJ2yfTPluOyM6SwMbKMVR5UAJ2wto38S0T4EfRL/I1yvzJyMzBDpMOYS4IzpImjpZ6B1n+0zgTeDM6CwNrJJ0paTD0UGa6E1MeyY6x5B9Qinz9yJDZJkzX9LW6CBpamWhd5jtGZSV+anRWRr4J0kro0M01ZuY9kh0jiH7hDKxK8s81nxJm6JDpKmXhd5RthcC24Djo7M0sETSXdEhmrJ9G+0bf/oxpcw/jAzR2/XocpnPyzLvrry21kG2lwOro3M0cIDyH6zt0UGasv1b4NroHEO2m3KSOvRQYq/M27br0Y+Fkl6IDpHi5Aq9Y2zfSZ1lvgf4fuVl/gjtLPNZWebhFkt6OjpEipX30DvE9sPANdE5GthJWZlXO7O5pRPTPqS8C/5xZIgscxZLejw6RIqXW+4dYPsoymnqudFZGthI2Uo8FB2kCdvHAi8Cs6KzDNmHlG/mn0SGyDJnaZZ5+kpuubec7WmUR0tqLPO1ki6ruMxPoPzbt63M32M8yvzv6XaZr5C0NjpEGh9Z6C1m+3TKHPPzorM0cIekpdEhmupNTNsOnBudZch2Ue6Zj0OZ/0dkhmDVThNMo5Nb7i1l+xzKzOcTo7M0sLTmlYftM4BXgTNikwzdLsqrfJ9FhsgyZ2WWefo6WegtZHs28BxwTHSWPh2ifC/fGB2kqd7EtC3ASdFZhmwnZdBKlnmsmyStig6RxlNuubeM7cXAZuor872U6081l/m5lG32Npb57DEo82vpdpnfKume6BBpfGWht4jtm4HHonM08B5wfvRkrkHYvpj2TUyD8s7/bEmfR4bolXnbXtfrxx2Sfh0dIo23vIfeErbvB66PztHAdsod8wPRQZrqTUxr25AVKE8D/1DSwcgQWebcI+mm6BBp/GWht4Dt9dQ5x3ydpCXRIQbR4nvQ2yiztL+MDJFlnmWeJi+33Ctm+zjbm6mzzP9PC8r8BtpZ5pvJMh8Hq7LMUz9yhV4p2ydTXlE7OzpLAytrP6lr+xfAz6NzjMBmSRdHh+j9sXRvdI5AayStiA6R6pKFXiHb0ymrqNrmmB8GrpK0ITrIIFo6MQ3gZUmXR4fIMmdtzY8qpThZ6JWxfR7lbfBp0Vn6tJ9ywOqt6CCD6E1Muyo6xwg8Kyl8eEyWeZZ5ai4LvSK25wFPAkdFZ+nTbuBSSR9EBxmE7ReB8BXsCGSZj4fHJS2ODpHqlYfiKmF7OeX1t9rK/C3KHfNqy9z2sba30s4yf2pMyvxmul3mT2eZp0FloVfA9m3A6ugcDTxPeft7X3SQpmx/h3ZOTINS5ouiQ/TK/K7oHIFekFTjTZU0ZnLLfczZXg0sj87RQPWndG2fArwGfDc6ywg8Kunq6BBZ5rwgaV50iNQOuUIfU7aPsv0cdZb5T1tQ5mcAO2hnmT+UZT4WNmWZp2HKaWtjyPbxlDvmNc4xXyJpXXSIQdj+HuXfv21DVqCU+bLoEFnmbAXmR4dI7ZIr9DFj+1TKyrC2Mv8CmNOCMr8AeIN2lvkDY1Lmt5Nl/kNJh6ODpHbJb+hjxPbZlJXhydFZ+rQH+FtJu6KDDKI3Me1Z4OjoLCPwgKTrokPYvgu4OTpHoB2UufKHooOk9skV+piwPZsyeay2Mt9FuZZWe5kvADbRzjK/L8t8LLxNeSM/yzyNRBb6GLC9kPKU63HBUfq1BZghaW90kEHYXkY7x58C3C3pxugQWea8Q1mZh46iTe2WhR7M9vXA+ugcDayVNEfSF9FBBtF7nezB6BwjcrekW6JDZJnzDuV8yYHoIKndstAD2f534P7oHA38qg3vTdv+Je19nez2MSnze+l2mb9LKfP90UFS++WhuCC2HwNqfOpxhaQ10SEG1eKJaQC3SLo7OkSvzG+IzhHofWBmzS8lprpkoU8x28cAG4C50Vn6dAj4O0nPRwcZlO0ngPAnT0cky3w8fEQLzpekuuTDMlPI9onAS8A50Vn6tA+4XNLO6CCDavHENIAbJd0XHSLLnI8oMwyyzNOUyhX6FLE9HXgFOD06S58+oIw+3R0dZBC2j6MMi2njkBWA6yQ9EB0iy5w9lJX5nuggqXuy0KeA7XMoZT4tOkuftgMLaj/Q05uY9irwvegsIzIuZd7mcwmTsZdS5h9FB0ndlKfcR8z2XMpTorWV+QZJM1tQ5qcAv6e9Zb4sy3ws7KVss38UHSR1Vxb6CNm+BngZOCY6S59WSboyOsSgbH+X9k5Mg1LmD0WHyDJnH6XM348OkrotC31EbN8KPBydo4F/lLQyOsSgehPTfg+cFp1lRK7OMh8L+4GLsszTOMhT7iNg+37g+ugcDVwpaUN0iEH1JqZtpL6ndCdrkaSnokPY/g/g76NzBDpAeTTm3eggKUEW+tDZXg8sjM7RpwPAPEnbo4MMyvbllKd02zhkBbLMx8UBytvs70QHSekrecp9SGwfT7kWNSM6S592U2YzvxcdZFC2FwFPROcYoQWSno0OkWXOQWC2pLejg6R0pPyGPgS2T6YcvqqtzHdSRp+2ocyXkWU+clnmHKKMQM0yT2MnC31Ats8E3gTOjM7Sp43ArDa8M237J7R3YhqUV/qyzOMdpuxm7YgOktLXyW/oA7A9g7LNfnx0lj6tkbQiOsQwdOBlsoslbY4OYfsR4KroHIEOA/MlbY0OktI3yRV6Q7bnAduor8xva1GZP0h7y/xLsszHyXxJm6JDpPRtcoXegO3lwOroHA0slbQ2OsQwtHxi2peU77TbooNkmQPlBkiWeRp7uULvk+07qa/MvwAua0OZ2z66NzGtrWV+kCzzcbJQ0gvRIVKajLy21gfbDwPXROfo015KQeyKDjKo3sS0jcAF0VlG5HPK/63ejA5i+0ngx9E5gi2U9HR0iJQmK7fcJ8H2UcAzwNzoLH16j1IQ1Y9y7MDEtM8pd5vDZ85nmQOwOMs81Sa33CdgexrwOvWV+Rbg+y0p89No98S0z8gyHydLJT0eHSKlfuUK/VvYPp0yx3x6dJY+rZO0JDrEMPQmpr0GnBKdZUQ+o0zqCv8kkmUOwIo2nDVJ3ZQr9G9g+xzKgzG1lflvWlTmX01Ma2uZf0qW+ThZIWlNdIiUmsoV+tewPRt4jvrmmK+UtCo6xDDYnkV5tKetE9M+oWyzhz+7a/t3wPzoHMFWZpmn2mWh/xHbi4HHonP06TBlCtfz0UGGoTcx7cXoHCP0CTBT0ofRQbLMAbipLX8Ip27LLfcj2P5H6ivz/ZRt27aU+SLaXeYfk2U+Tm6SdE90iJSGIQu9x/b9wN3ROfr0AXCBpLeigwyD7Wtp98S0jykDcbLMx8PtWeapTfJhGcD2Y8Di6Bx9eosy+Wl/dJBhsP1T4JfROUZoN+Wb+e7oILZfAi6LzhHsHkk3RYdIaZg6Xei9l8eeAWZHZ+nT85Rv5oejgwxDByamfQhcJOnj6CBZ5kCWeWqpzha67ZMpz4ieHZ2lT6skrYwOMSy9iWnLonOM0IeUb+afRAfJMgda9r+flI7UyUK3PR3YDJwaHKVfP5H0m+gQw2L7GWBBdI4Reo+yzZ5lPh7WtGV0cEpfp3OFbvs8yinqadFZ+rRE0rroEMNg+2jgWeDi6CwjtAuYI+nT6CBZ5gCslbQ0OkRKo9SpQu/db14PHB2dpQ8HKFOftkQHGQbbJ1D+oGrrxDQoZX6hpM+ig9h+FZgTnSNYlnnqhM4Uuu2rgEeic/RpD2VaWvhrYsNg+yTK0JizorOM0E7gkizzsfG4pNpusKTUSCfuodu+gfrKfBdwfovK/DRgB+0v89lZ5mPj6Szz1CWtL3TbNwP3Rufo0yvADEl7o4MMQ29i2g7gjOAoo/Qmpcw/jwxh++gsc6CU+cLoEClNpVZvuVf6LnurvvfZPhd4GfhOdJYR2kZ55OdgZIjeYcONwMzIHGPgBUnzokOkNNVau0K3/QPqK/N/bVmZzwJep/1lPjfLfGxsyjJPXdXKFbrtMylboDWN3mzVLOYOTEyD8pbBFZK+jAyRZf7ftgKXteUFxZT61bpCtz2NcjjptOgsk3SIci1tY3SQYan0RkG/NksKv0efZf7ftlI+exyKDpJSlP8HAAD//+zde7RdVXkF8Dk7cBTkVSoIannUqij4AFsZihAJIWAImpJhFEoEEXmMlKDpECm+QNRCSxxEoaaSEpA2POQRCaUEg5eAAZqiITZiE42QSNDQQEJCTDKk9esfa5/rvZf7OOeevda39t7z94+Q3Lu/qSaZ2fusvVYdH7nfheqU+QaE07fqVOZno/5lviiTMt8NKnMgLLhUmUvj1arQi0M+jvLO0aZVCK+lLfcOUhYz+wKAa71zRHYPyeO9QxRl3gOV+TKENQwqc2m82jxyN7OPA7jOO0ebHgEwkeQL3kHK0oAT04BQ5u57z/cp83d5Z3G2AmFHvs3eQURyUItCN7NDAPwIwM7eWdpwF8m/9A5RJjO7GcAp3jkim09ysncIlXmvFQh75W/0DiKSi8o/cjezVyJ8bl6FMr+qhmV+N1TmSajMe62EylzkZXbyDlCC6wG8wTtEG6aRnO0doixmtiuAu1HvE9MA4BaSp3qHMLM9EBbANb3MVwMYozIXeblKF7qZfQzAh71ztGEyyfneIcpSnJjWA+Bw7yyR3UjyDO8QRZk/COAw7yzOViN8Zr7BO4hIjir7GbqZvQrALwDs6Z1lGBsBnETyUe8gZWnIiWmAyjw3a1Cj8w1EYqjyZ+hXI+8yXwvgiJqV+UGo/4lpADBHZZ6VdQh35ipzkWFU8g7dzMYD+J53jmEsB3B8nR4NmtmbEcrl1d5ZIptD8hzvEGa2F8LHGk0v8/UId+ZrvIOI5K5yhW5mOyNsynKAd5Yh3AvgQ3Xa6KI4Ma0HwB95Z4nsGpLTvUMUZf4DAId6Z3G2HuHOfLV3EJEqqOIj979GvmU+l+SJNSvzsQjlUvcyn6kyz8oGqMxFOlKpO/TiM8WnAezhnWUQnyf5Ve8QZTKzkxBeTau7mSQv9A6hMu+1EeGMg5XeQUSqpGqvrX0GeZb5VJLzvEOUqSEnpgHAl0he6h1CZd5rM8KmMSpzkQ5V5g7dzPYG8EsAu3hn6eNFAB8kudg7SJmKE9PqfsgKAFxIcqZ3iOLX9mKozDcDOJbkMu8gIlVUpc/QL0ReZd5afbvYO0iZzOxSqMyTKcp8CVTmW6EyF+lKJe7Qiz2sfw1gN+8shScAvJ/kOu8gZTKzawGc7Z0jgekkr/EO0afMD/bO4mwbQpkv9Q4iUmVV+Qz9AuRT5g8C+ADJF72DlKkhJ6YBwDkk53iHUJn32gbgBJW5SPeqcoe+AcDe3jkA3EayCnvHd6Q4Mc39nO8EcinzfRH+Ytj0Mt8BYDzJJd5BROog+8/QzezjyKPML69bmZvZrma2BM0o8zMyKvNHoDIHgIkqc5HyVOGR+3neAQCcRXKud4gyNejENCCU+Y3eIfqU+eu9s2RgAske7xAidZL1I3czOxTATxwj7EA4+vRexwylM7PXIJR53Q9ZAYBTSd7iHUJl3s8kkgu8Q4jUTe536Bc4zt4A4ESSP3TMULrixLSHAOzvHCWFLM6hV5n3ozIXiST3O/QtAHZ3GP00gPeRfMphdjQNOjENyKfMX4fwFyiVOTCF5O3eIUTqKts7dDP7AHzK/FmElbd1K/MjANyH+h+yAgAnkbzHO0RR5g8DONA7SwamqsxF4sp5lfvJDjO3IOwjvcphdjTFiWmLoTJPRmXeT+3OOhDJUbaP3M1sI4C9Eo8dV7eVtw06MQ0Ajie5yDuEyryf2r0hIpKrLO/QzexYpC/zT9awzM9Ac8p8bCZlfiBU5i3TVOYi6WRZ6ACOTzzvTpLfSDwzKjM7H8AN3jkS2I5Q5ou9g6jM+5lBcrZ3CJEmybXQxyactRLARxPOi87MvgLgau8cCWwHcFxmZf467ywZmEFylncIkabJ7jN0M9sV4SjFFLYBeAfJ1YnmRdegE9O2Ihzq8Yh3EJV5P5eQvMw7hEgT5fja2rEJZ51RszK/A8Bk7xwJbEG4M3/MO4jKvJ9ZKnMRPzkW+lGJ5txQp/dizew+pF974GELwqY/y72DmNnrETaNUZmHMp/hHUKkyXIs9MMSzHgKwPkJ5kRXfERxH4D3emdJYBOAYzMq80cA7OudJQOzVeYi/nL8DH0T4m+A8k6Sj0eeEZ2ZvQrAIjTjxLRNAI4m+YR3EJV5P3NJnuUdQkQyu0MvDrGIXeaX1KTMX4PwuPcN3lkSeA5hBz+VeV5U5iIZye21tdiP239ah0U7xYlpS9GMMn8WwFGZlPnBUJm3zFOZi+Qlqzt0AAdHvv5pka8fnZm9DcD9aMaJac8COJLkk95BijJfAmBv7ywZuJ3kVO8QItJfbnfoMXfYuiKHxVTdKE5MexjNKPNnoDLP0QKSU7xDiMjLNaXQnwTwpUjXTqLPiWkeR8qm9gyA96rMs7OA5CTvECIyuNwK/aBI1z2H5I5I147OzCYD6AGwi3eWBNYilPla7yAq834WqsxF8pZboce4Q7+H5PcjXDeJ4sS0O7xzJPIk8inzQ6Eyb+khOcE7hIgML6v30M3MIlz2z3J4dDsaxYlpTThkBQhlfiTJZ72DFGX+A6Q/wjdHSwCMr/ITLpGmyOYO3cxifDY8s8JlfjmaU+aroDLP0RKEA3BU5iIVkM0dupm9DsC6Ei+5CcCBJF8s8ZpJmNkNAM7wzpHIKoT3zJ/zDqIy72cpwja727yDiEh7cnoPvewd4mZWtMybcmIaADyBsANcDmV+GMLCQ5U5sAzhNDuVuUiF5FToe5R4recBfL3E60VnZrsA+C6acWIaACxHuAPc5B2kKPMHUe6vwapahvD/y1bvICLSmZwKvczH//9A8jclXi+qYv3A/QCO8M6SyHKEI1C3eAdRmfezAqHMN3sHEZHOZbMoDkBZK9yfB/CNkq4VXXFi2sNoTpk/BpV5jlYifPyhMhepqDoW+pVVWZVrZq9FOOzjbd5ZEnkE4Q5QZZ6X1QDGkNzoHURERq9uhb4dwDdLuE50ZvZGAI8CeJN3lkQeQXgFyv2zWTN7F1TmLasRzpnf4B1ERLqT02foL5VwjX+uwsp2M3s7worqV3lnSWQxgBNJbvcOUpR5D4DdvLNkYA1Cma/3DiIi3cup0MtY7XxVCdeIyszeDeA+NOfucDHJsd4hAJX5AOugMheplZweub/Q5ffPJ/lUKUkiMbNxCIXSlDJfpDLP0nqEMi9zIycRcZZNoZfwPvKsUoJEYmaTEF5Na8KJaUAo8yzeqTezI6Eyb2mV+RrvICJSrmwKvTDau/SnSD5UapISmdkUhE1jmuK7mZX5/VCZA8AGhDJf7R1ERMqXW6H/cpTfd12pKUpkZh8C8B3vHAnNJ3mydwigX5k35anIcDYivJqmMhepqdwK/aej/L7rS01RkqLMb/POkdB8klnsQ68y72cjwqYxK72DiEg8uRX6E6P4nvtJ/qr0JF0ysw+iWWV+i8o8S5sRynyFdxARiasOhX5D2SG6VZT5Xd45ErqR5KneIQDAzI6ByrxlK8LOfCpzkQbI5jx0oHf3tJ91+G175LSZTEPLPIuz24syf8A7Rya2IZT5Uu8gIpJGVnfoJH+O8AdRu+7PrMzfhWaV+RyVeZa2IWyzqzIXaZCsCr3wow6+9p5oKTpkZvsjozwJzCF5jncIQGU+wA6EMl/iHURE0sqx0B/v4GuzKFAz2wXAQgD7eGdJ5JqMynw8VOZ9TVSZizRTlQv9qeIRfQ5uAXCId4hEZpKc7h0C6C3z73nnyMgEkj3eIUTER5ULPYud18zsKwA+6J0jkZkkL/QOAajMBzGB5ELvECLiJ7tCJ/ljhNdtRvJo7CwjKbZ0/Zx3jkS+pDLP1iSVuYhkV+iFB9v4mk4Wz5XOzA4FcKNnhoQ+S/JS7xCAynwQU0gu8A4hIv5yLfTFI/z8ZpJPpggyjDsB7OycIYULSV7uHQIAzGwiVOZ9TSV5u3cIEcnDTt4BhrB4hJ9/LEWIoZjZVQDe5Jkhkekkr/EOAfSW+b9558jIVJLzvEOISD6yvEMn+UMAW4b5ErfH7WZ2HIBPec1P6ByVebbOUpmLyEBZFnphuEU+LoVuZnsBuNljdmLnkJzjHQJQmQ9iGsm53iFEJD85F/pwm8Y8lSxFf/8CYG+n2amcoTLP1gySs71DiEieci70e4f5uV8nS1Ews08AmJh6bmJnksxi5b6ZnQyVeV8zSM7yDiEi+crqtLWBzGwpgCMG/jjJpLmLR+1rAeyecm5ip5K8xTsE0Fvmd3rnyMglJC/zDiEiecv5Dh0Y/OSy9clTAJeh3mU+WWWerStU5iLSjtwL/Y5Bfizp43YzOwTA+SlnJjaZ5HzvEIDKfBCzSF7sHUJEqiHrQie5CsATA374V4lj1HkR0kkZlfkpUJn3NZvkDO8QIlIdWRd6YeAf8u3s814KMzsJwJhU8xI7iWQux8+egma8DtiuuSSneYcQkWqpQqHfNODfU2a+KuGslI5XmWdrLsmzvEOISPVkX+gkV6L/yWpJMpvZDABvSDEroe0AxpFc5B0EUJkPYp7KXERGK/tCL/Td6CRV5rotRtoO4ESSPd5BAJX5IG4nOdU7hIhUV1UK/RYAvyn+OXpmMzsPwD6x5yS0HcBxJBd7BwEAMzsdKvO+FpCc4h1CRKqtEoVOcjvCtqtAmswXJZiRylaEMn/EOwjQW+bf9s6RkQUkJ3mHEJHqq0ShF75V/OduMYeY2UcAHBRzRkJbAByrMs/WQpW5iJQl661fBzKzxwDsQ/KgiDNWAHhrrOsntAXA+0gu9w4CqMwH0UNynHcIEamPKt2hA8DXARwY6+JmdgLqUeabkFeZnw2VeV89qP9BPyKSWKXu0AHAzJ5BeIy8KsK1HwBwTNnXTWwTgKNJDtxhz0VR5td658jIEgDjSe7wDiIi9VK1O3QAuBwR3g83szej+mX+HFTmOVsK4ASVuYjEUMVCvw5xXik7I8I1U3oWwFEq82wtQ3jbYJt3EBGpp8o9cgcAM9uPZKnHqBaP8l9b5jUTehbAkSSf9A4CqMwHsQzhY6LN3kFEpL6qeIeOCGU+DtUt82eQV5mfD5V5XyugMheRBHbyDpCJ070DjNIzAN5Lcq13EKC3zK/2zpGRlQCOUZmLSAqVfOReJjPbGWFl+M7eWTq0FuHVNJV5nlYjPDnZ4B1ERJpBd+jAFFSvzJ8EMIbkM95BAJX5IFYjvG2gMheRZCr5GXrJTvMO0KGfIdz55VLmn4bKvK81CGVe6joPEZGR6JG7mXln6MAqhMfsz3oHAXrL/ErvHBlZB+A9JNd5BxGR5mn0I3czO847QwdWIbxn/px3EEBlPoh1CHfmKnMRcdH0R+5VKfQnoDLP2XqEMl+TcqiZHWRm+6WcKSL5anqhj/cO0IblCGWhMs/TBjiVOYAHANxqZq9IOVtE8tTYQjezPQG80zvHCJYjfGa+yTsIAJjZpVCZ97UR4W2D1SmH9inzgwCMgRYliggaXOgATvAOMILHEMp8i3cQADCzKwFc4p0jIxsRNo1ZmXLogDJvOdfMzkuZQ0Ty0+RCz/lx+2MI24XmVOaf9s6Rkc0IZb4i5dAhyrzlG2aW+xMnEYmoyYV+tHeAIfwAwFiSW72DACrzQWxF+MtWTmUOAK8AMN/MXp0qk4jkpbHvoWf6/vliACeS3O4dBFCZD2IbQpkvTTm0jTLv6yGEY1pfiplJRPLTyDt0M3uHd4ZBLCY5NqMyvxoq8762ATgh8zIHtEhOpLEaWegADvUOMMAikmO9Q7QUZX6+d46M7EAo8yUph46izFu0SE6kgZpa6Id4B+hjEcnjvUO0qMwHNbFCZd6iRXIiDdPUQs/lDv0elXn2JpDsSTmwhDIHtEhOpHFU6H7mkzzJO0SLynxQE0guTDmwpDJvOQDAbdpJTqQZmlrob3SeP5/kZOcMvczsWqjMB5pU8TJv0SI5kYZoXKGb2VucI9yUYZmf7Z0jM1NILkg5MFKZt2iRnEgDNK7QAfyp4+xbSJ7mOL8flfmgppK8PeXAyGXeokVyIjXXxEI/wGnudSRPdZr9MirzQU0lOS/lwERlDmiRnEjtNbHQ/9hh5hySn3CYOygz+zZU5gOdVeMyb9EiOZEaa2Kh75l43hyS5ySeOaSizE/3zpGZaSTnphzoUOYtWiQnUlNNLPTdEs66Q2WevWkkZ6cc6FjmLeea2cecZotIJCr0eB4l+aFEs0akMh/UjAaWecs/apGcSL2o0ONYA2BigjltUZkP6oskZ6UcaGb7IY8yB4BXQovkRGpFhV6+FwCMJ7kp8py2mNnNUJkPdAXJL6ccmFmZt2iRnEiNqNDL9zGSqyPPaEtR5qd458jMLJIXpxzYp8zfnHJum7RITqQmmljoFvHas0neFfH6bTOzm6AyH+jrJGekHJh5mbdokZxIDTSx0P830nV/DuBvIl27I2Z2J4BsNrHJxFySn0o5sCJl3qJFciIV18RC/79I151Mckeka7fNzGYDONk7R2bmkjwr5cCKlTmgRXIildfEQn8pwjWvJfmTCNftiJldBECHcPR3g8q8bVokJ1JhTSz0sh+57wDwhZKv2TEzOxPAFd45MjOP5JkpB5rZK1HNMm8ZA2CmdwgR6VwTC/23JV9vFsn/KfmaHTGzdwNIunVpBdxOcmrqoSS3AXgw9dySXaBFciLV08RCf77Ea22G812xme0DYL5nhgzNJznFcf50AEsc55dBi+REKqaJhf5cidf6JsnNJV6vI2a2C4B/B7CfV4YMLSQ52TMAyZcATAbwtGeOLmmRnEjFqNC7k3Tr0EH8K4C/cM6Qk4UkJ3iHAACSGwBMArDdO0sXtEhOpEJU6KM3z/OzczM7G+EuUIIeZPa6HsnHASRdlBfBGABXeocQkZE1sdDLKuGvlXSdjpnZgQCu8pqfoSUAJuawD8BAJG8F8PfeObr0STP7K+8QIjK8Jhb6kyVcY1lx9+XlegC7Os7PycMATsixzPv4LIB7vUN0aY4WyYnkrXGFTnJVCZe5qYRrjIqZfRLAWK/5mVkG4P3Fq2LZIvk7hK14y/i150WL5EQyR+8AHsxsLcKCn9Ha1+PzczM7GMDK1HMztQzAsZ5vGXSq+P9vKYA9vbN04SEAxxUr+UUkI427Qy/8oovvfcBxMdzNTnNz82MA46pU5kDv06FTAfzOO0sXtEhOJFNNLfSfd/G9t5WWogNmNg3A4R6zM7MS4c78Be8go0HyXgCf887RJS2SE8lQUwu9mwVt95WWok1mtje0TzsQynwMyY3eQbpB8goAt3rn6JIWyYlkpqmFvmyU37eOZBmr5Dv1NQC7O8zNyc8QynyDd5CSnInu/mLpTYvkRDLTyEIn+Z+j/NYFpQZpg5m9B8DpqedmZg2A99WozEFyO8JOclX+76Sd5EQy0shCL6wYxffcX3qKkV3vMDMn6wAcTXK9d5CykXwaYbe/Kq8Y1yI5kUw0udB/OIrv+Y/SUwzDzC4EcHDKmZlplfk67yCxkFwC4HzvHF3SIjmRDDS50B/q8OufI/nrKEkGYWa7Ieww1lTrEcp8jXeQ2Ehei+pvD6tFciLOmlzoCzv8+oejpBjadAB/lHhmLjagIWXeR9W3h9UiORFnjS304jPZTrbiHM0j+lEpzjn/TKp5mdmIsJp9dYphZvZ5M/vbFLOGU5PtYbVITsRRYwu90MkityeipXi589HMu/ONAI4hmWR7WzO7FMCXAXzVzNzPUS92vpsEoFI74A2gRXIiTlTo7Uu5h3oT7843I5T5aN4+6FhR5pcU//oHAG4u9lp3VZPtYbVITsRB0wv9+wC2t/OFJP87chYAvVu87p1iVka2ImznmqrMv4zfl3nLngDuMjP3g1Nqsj2sFsmJJNboQif5IoC72vjSbvZ+79TnE87KwVaE07tGu3tfR8zsagz9v/HBCHfq7r8varA9rBbJiSTm/gdXBto523xt9BQAzOyjAF6TYlYmtiGcZ7409iAzY1HmI73zPQHAF2PnaVPVt4dtLZLTnzMiCTT+NxrJuwFsGuHLfpUiC4CLE83JwQ4AJ5CM/jqgmRHADWh/A5cvZLJIrg7bw44B8HfeIUSaoPGFXvjOCD8fvdDN7CgAb4k9JyMTi13SoupT5p3sh5/TIrk6bA97kRbJicSnQg+uG+HnU+wQNz3BjFxMINkTe4iZ7YTOy7wlp0VySwBc4J2jS1okJxKZCh0AyccA/GiYL3k+5nwz2xfAh2POyMgEkp3u0texosy/g+5Oqstpkdw/AfiWd44uaJGcSGTuf1Bl5Jphfu6FyLPPinz9XExKVOZ/iFDmJ5dwuQnI5zPg6QCif0wRkRbJiUSk31gFkjcA2DLET6vQuzeFZPTz5IsyvxvllHnLRWb2kRKvNyokX0L4PP1p7yxd0CI5kUhU6P1dO8SPD1X0XTOztwN4fazrZ2IKydtjD+lT5uMjXP56Mzs8wnU7QnIDwsr3tjZEypQWyYlEoELv7+ohfvy3EWfW/Q+2qYnKfDfEK3MA2AVhkdw+ka7fNpKPI7yjXmVaJCdSMhV6HyR/CWDOID8Vs9BPjXhtb+eSnBd7SFHm9yFembfsD+DOHE4TI3krqn2GuhbJiZRMhf5yXx3kx6K8A2xmf46wUKiOppEc6iOM0pjZXghlfmTsWYWjMPSTnNSqfoa6FsmJlEi/kQYguRbpXg/6QKI5qU0jOTv2kKLMe5CuzFvONbPzEs98mZqcoa5FciIloXeAHJnZAei/f/sBxY5dZc9ZBsB9oVXJZpCcFXtInzI/LPasIbyEcEKc+2tkxY52SxE2w6mq00i2c66CiAxBd+iDKD5L7/te+k5lzzCzP0H9yvyyRGW+L3zLHABegfB5+v6OGQDU5gx1LZIT6ZIKfWgXA1hf/PMuEa5ft8ft15EceMZ46YoyfxC+Zd6yD8LK9xi/PjpSgzPUW4vkqvyUQcSVCn0IJLfi9/urx/gDe1yEa3pZSPITsYeY2YEIZe5+aEofhwO43jsEUIsz1A8AME+L5ERGR79xhlG8P30fgN0jXH5shGt6+C+E3cuiyrTMWz5iZp/yDlGo+hnqE6FFciKjokVxIyg+634LyUUlXvOtAFaUdT1HzwF4G8n1I35lF/qU+YEx53Qpp0Vy+yMcNuS+CU4XtEhOpEP/DwAA///t3f+vn2V9x/Hnm6VbKsyqS9XJioNoSnQzFrIB0iFWWXKEaWK2FWUO+WEWWfyyHxTFuKGuCGYzGyRada7qBm3dUoPiUBdZohKpGVbnWCQ62cSowKJUDLh06Xs/3FfxUMrp577P53O/r/d9vR5/wDmvnJ6e9+e6r9d9XVqhH4OZfXeew7w4d85fL8rSCMN8I/UPc6irJDeFO9RVkhPpSQM9xrnRAebgjWb2r4v8BomG+WE1leSy36GukpxITxroMc6KDrBKt5nZXyzyG7j7c+mG+VMW+X0WoKaSXPY71FWSE+lB/1FGVs6uflp0jlV4APi9RX6DMsxvId8wP2yru785OkSR/Q51leREZqSBPr7s+4JvMrPvLuqLLxvmT1zU9xjJdndfig4xkTvUdd2qyAw00MeXeaDvK49xF8Ldn8c0hjl0/7d2lR5AqIncoa6SnMgxaKCPL/Nxrxcv6guXYf4ZpjHMD1tHV5ILL3Ytu0M96/GwKsmJHIMG+vhqOLJ0iPeUM8Pnzt3PoxvmJyzi6wfbSLdSD/+/Vu5Qz3w8rEpyIivQwTIjc3ePzjDAj4Cnm9kD8/7CZZh/EviFeX/tylxjZlUU5dx9N7A1OscqVPOzFKmJPumOyN1/NTrDQFcsYpgXb2L6wxy6YtdC3w7oIfvxsCrJiRyFVugjcvctwOeic/T0PTM7cVFf3N3X0x1TGn7C2ggeAs4u+9mhJnA87IPA6Wb2jeggIrXQCn1cp0QHGOAvF/nFlzWwMx9TOqu1dCW58CE6geNhVZITOYIG+riyDfQHgPct+puUFWvmY0r72EB35vua6CATOB72VFSSE3mY/iOM6+ToAD3tMLNR3l2ewDGlfWwGrosOAZP4ueskOZFCe+gjcvfPAVuic/RwUnk0O4qyar2FbuC14BIz+3B0iIn83HXdqjRPK/Rxhe+d9vDZMYc5TOaY0j7e6+7hBw1N5Of+QXc/NTqESCQN9HFlGuh/G/FNJ3JM6axqKsll/7mrJCfN00Af11OjA/TwiahvXEpyl0V9/5HVVJI7fDxsVirJSdP0iz8Sd39CdIYePjFWGe6xlL3lzGWtPmoqye0BronOsQoqyUmzNNDH80vRAXrYGx2gyH6Xdx/b3P3S6BDFFcDN0SFWQSfJSZPUch+Juz8LuCM6x4yeXPZUwzV2ktxBYEt5PzxU2YveR3e5TEY6SU6aoxX6eH4+OsCM9tcyzGESZa0+1tDtp4d/eDGzA3Q/9wPRWQZSSU6ao4E+nvDS04w+HR3gSBMoa/Wxnq75vjY6SLku9+XkvUNdJTlpin7Rx5Nlhf6F6ABHU8pafx2dYySbgJ3RIQDM7GZy36Gukpw0QwN9PFlW6LdHB1jBG2mnJLfV3au489vMrgb2ROdYhcvd/fzoECKLpoE+ngwr9LvN7N7oEI9lIiea9bHd3ZeiQxTZ71C/XifJydRpoI8nwz5k9X+wGyvJHQfscvfwpnk5l+ClQDWFyZ7WoZKcTJwG+ngejA4wgzujA8yisZLcOrqSXPggmsAd6irJyaTpF3s8GVaU34wOMKsJnGjWx0a6lXr4/9cJ3KGukpxMVvgfiIZkWKF/KzpAT9lPNOtjiUoG0QTuUFdJTiZJJ8WNxN1PAv47OscxPNPMUg318ij667RxkhzAi8urZKEmcIf6AeBMnSQnU6IV+ngyrND/JzpAX8tONMuwpTEPtZTksr9xoJKcTI4G+niqH+hmdn90hiFUkosxgTcOVJKTSdEv8kjM7EHgp9E5VlDt++ezUEkuxgQ+TKkkJ5MR/gehMd+LDrCC/40OMAcqyQWYwIcpleRkEjTQx/WD6AAryPpu8cPM7BDdZSIp3qefg8vdfWt0iCL7hymdJCfpaaCP6/vRAVbwf9EB5qHBktxOd98UHWICH6ZUkpP0NNDHVfMK/eeiA8xLufYz875uH2vpSnLro4NM4A51leQkNf3ijqvmFfoJ0QHmaQL7un1sAPaWd8NDLbtDPesWzvnAn0aHEBlCA31cNa/QJzXQi+z7un1sBq6LDgEP36Ge+XjYt6kkJxlpoI/rP6MDrOD46ADzNoF93b62uful0SEg/fGwx6GSnCSko19H5O5Poe5V+olmVvOrdYOUk9X20RWfpu4gsKVcohJqAsfDfoPueNisnQBpjFboIzKze4AfR+dYwYnRARZh2b5uC9bQ7aeHn20/geNhVZKTVPSLOr7/iA6wgl+JDrAoZV+3lZLcerrm+9roIBM4HlYlOUlDA318Ne/nPjM6wIK1VJLbBOyMDgGTOB5WJTlJQQN9fDVf1/jc6ACL1GBJbqu7vyE6BKR/jVAlOUlBA318GuiBJnD4SV/vdvdaSmmZn5DoJDmpnlruI3P3k4FvR+dYwfHlZrhJc/cl4Cba+FB7H3C6mYWX08pA3Ed3Y1xGnwJeUp72iFSlhT9mVTGzu6h7ddjEXmEpyb0zOsdIairJZX9CopKcVEsDPcYXogOs4PejA4zoHeR9BNxXTSW5w68RZl3lqiQnVdJAj7EvOsAKzq9hJTeGRktyb44OAQ8/IXlrdI6BVJKTKmmgx6h5oK8FLogOMZYJPALua3vpD4Qzs6uBPdE5BlJJTqqjgR7jy9EBjqGlx+5TeATcx3HArnIcbg0uAfZHhxjoVOD66BAih2mgByirwppfX/vd1lYeyR8B97WOriQX/m9sZg/RPSG5LzrLQOfXso0hooEe57boAMdwcXSAsSV/BNzXRrqVevjfgPI63cvIe4f6dpXkpAbh/5kb9s/RAY7hj6MDBLmEdkpyS8BV0SEAyu1wWe9QV0lOqqCDZYK4+xOAH0XnOIbnmdmXokOMrbHrVgEuLEezhnP3HcC26BwD6bpVCaUVehAzux+4PTrHMbw6OkCExkpyADvdfVN0iOK1QPhd7gOpJCehNNBjfTY6wDG8yt2fFB0iQmMlubV0Jbn10UEmcIe6SnISRgM91meiA8ygyVU6NFeS2wDsdfc10UEmcIe6SnISQnvowdz9J8Dx0TlWcI+ZPTU6RJRyat6tdEentuD9ZnZpdAgAd98K7I7OMdABuv30ml9PlYnRCj3eLdEBjuEp5Q9rk5a9J91K0Wmbu78qOgSkv0NdJ8nJ6DTQ490UHWAGr48OEKm8J91SSe69FZXkMt+hrpKcjEoDPd4/RgeYwVnu/rzoEJFUkosxgQt0VJKT0WigBzOzH1L/ITMAV0YHiKaSXIwJXKCjkpyMQgO9DhmGxHnuflp0iApkvkykr83AddEhIP3ZADpJTkahgV6Hj0cHmNE7owNEm8BlIn1tc/cqWu/Jtz0Ol+QeFx1EpksDvQLlsXuG4s+LtUp/xGUiGVeLQ1zr7pujQ0D6bY9TgQ9Gh5Dp0kCvx8eiA8zoHdEBalAuE8m6WuxrDd1++oboIEXmbY9XqCQni6KDZSrh7r8I/Dg6x4zOMrPar38dhbvvBlp5T38/cHbZdghVPlzcDoQ38Qc4BLzEzD4VHUSmRSv0SpjZA8CN0TlmpFX6z2ReLfa1CdgZHQIese0R/uFiAJXkZCE00OvyN9EBZnSeu58bHaIGDZbkttbyyLhse1wSnWMgleRk7vTIvTLu/n0gw9npt5nZWdEhalFKY7fQ7TdP3SHggtI6D+fuVwOXR+cY6AYzuyg6hEyDVuj1+VB0gBmd6e4XRoeoRVktvi46x0iOA3a5+8boIEXm42FVkpO50Qq9Mu5+MvDt6Bwz+j7wDDN7MDpILdz9w8DF0TlGcidwRjnJLVS5BGUfUMuHjD5UkpO50Aq9MmZ2F/XfwHbYL9POq1uzeg3tlOQ20q3Uw/+OJD8eViU5mYvw/4hyVFnKcQBXuPsp0SFq0WBJbgm4KjoEpD8eViU5WTUN9Dp9HLg/OkQPH4gOUJNlr1QdjM4yksvdfSk6BKQ/HlYnycmqaKBXyMx+Cnw0OkcPL3T3C6JD1KSxkhxUVJJLfjysSnIymEpxlUpWjgO428xOig5RG3ffAWyLzjGSmkpya4Fb6Q7DyUYlORlEK/RKlXJclvPdATa4+9uiQ1TotagkN7rkXQaV5GQQrdAr5u7PAb4WnaOnk83sv6JD1CT5ueNDXGNmVTw2Tn7gzzeA0/VaqMwq/JO0PDYz+zfgc9E5evpIdIDaNFqSq+LCmuRdBpXkpBcN9PpdEx2gp3Pc/dXRIWqTfLAMsdPdq9i/NrMdwPujcwykkpzMTI/cE3D3rwHPic7Rw0/oTpC7JzpIbRoryd1N98g4fB/b3dfQPXrfHJ1lAJXkZCZaoefwrugAPZ0AXB8dolKvBb4YHWIkG4C9ZZiGMrODdNsed0dnGeBwSU5vkciKNNATMLPdwF3ROXp6obu3cqb5zJYNlvBV60g2A9dFhwAoTwpeSs471HWSnByTBnoe744OMMC17n5idIjalMHSUklum7tfGh0CwMz2k/cO9dNQSU5WoIGeRCn2fCc6R0+PR633o2qwJHdteYUsnJntIV/Z9DCV5OQxaaDn8vboAAPo0ftjSN6+7msN3X76huggReY71Le7+/nRIaQ+arkn4+7fBJ4RnaOnHwO/Vt7HlmWSt6+H2A+cXU5yC5X8DvUDwHPMLNtTO1kgrdDzuTI6wACPJ9cxtqNJ3r4eYhOwMzoEpL9DXSU5eRQN9GTM7HrgW9E5BjhTe39Hl7x9PcTWWn4Xkt+hrpKcPIIGek5XRAcY6F3uflp0iBqV9vVl0TlGtL2iklzmO9RVkpOHaQ89KXe/A3hWdI4Bvg08u9z5Lkdo7CS5++hOkqtiu8HddwNVnEHfk06SE0Ar9MyyrtJPAXZEh6hYSyfJrQduLHeX1+AScl51q5PkBNBAT8vMbgS+FJ1joIvdvZVVaC8qycVJfoe6SnKigZ5c5j3XHdpPPzqV5OIkv+pWJbnGaaAnZmZfJffBJJ909ydFh6hR8iNKh9ju7kvRISD9KX4qyTVMpbjk3P2JdEWzJ0RnGehfzGxLdIhauftfAa+PzjGSA8AZ5VWycIkLioeAF5jZ56ODyLi0Qk/OzH5E3oIcwAvcPdv1sGN6I+2U5NbRleTWRQcpshYUjwP+QSW59miFPhHuvh94bnSOVXiJmX0yOkSN3H09cDvd/eItuBm4wMzCD3tJ/rP/CvBbZvZgdBAZh1bo01HF9ZSrcIO7Pz06RI0aLMktAVdFh4BH/OwzHg+rklxjNNAnwsz2AX8XnWMVTgA+ER2iVg2W5C539yoOeSk/+6zHw6ok1xA9cp8Qd38qXUGuloM6hrjBzC6KDlErd78auDw6x0georuZrYrDXspgzNj3UEmuEVqhT4iZ/QB4S3SOVXqFu7cysIa4gpxFrSHW0pXk1kcHATCzq4E90TkGUEmuEVqhT5C73wacEZ1jlV5qZnoEfxTJi1pDfBHYUk7RC1WOqb2V7oS7bFSSmzit0KfpldEB5mC3u2e8fGbhGizJbQauiw4B6Y+HVUlu4jTQJ8jMvglkL8KsBT7t7k+LDlKjBkty29z9VdEhIP3xsCrJTZgeuU+Yu3+FnI8Gl7sTONPM7o8OUiOV5OK4+6XA+6JzDKCS3ERpoE+Yuz8b+PfoHHPwZeD5ukP90dz9OOAmune3W3A33R3qVTzyTnw87L3Ab5jZd6KDyPzokfuEmdkdwNujc8zBbwIfiw5Ro3Ka2stp57rVDcBed18THaTIejzsk9F1q5OjgT5xZnYlcEd0jjn4HXfPfHDOwpjZAVSSC5H8/nqV5CZGA70NU2i9A/yBu/95dIgaNVqSq+K44+RvHbzC3d8QHULmQwO9AeWP/dXROebkre5+WXSIGpnZHuCa6BwjutbdN0eHgPQfqN7t7udEh5DVUymuIRNpvR/2h2amR/BHaLAkdx9dSa6KR96J3zpQSW4CNNAb4u4nA18Hjo/OMicXllWpLFPuE98HbIzOMpL9dK+zhT/yTv6BSifJJadH7g0xs7uAP4rOMUe73f3C6BC1WVaSy3jl5xCbgJ3RIeARbx3cGZ1lAJXkktNAb4yZ7QI+Ep1jjna5+29Hh6iNmd1JN1hasbWWE9CSf6BSSS4xPXJvkLsfD3wVeEZ0ljl6pZn9fXSI2iTe0x3iEHCBmd0cHQTA3ZfoHr9nWzgdBF6kk+Ty0UBvlLtvotszmxLtqR8h+Z7uEAeAM8oTinCJ71BXSS4hDfSGufufAO+JzjFHP6U7IvbL0UFq0mBJ7k66oV7FI2933w1sjc4xgEpyyWigN87dPwNMaQ/6h8C5Zvb16CA1cfeNdEN9XXSWkdxM9/j9UHSQ5Heo32BmF0WHkNlk29uR+bsIuCc6xBw9CfiCu58XHaQmy0py4QNuJEvAVdEhIP0d6irJJaIVuuDupwAnReeYs0Mq9Tyau18J/Fl0jhG9uKKS3GbgFqCWi2VmpZJcEhroIg1RSS5W4jvUVZJLQANdpDEqycVKfIe6SnKV0x66SGOSH3wyxEa6A4hq+XuX9Q7104D3RoeQx1bLL7iIjEgluTjJ71C/uJZra+XR9MhdpGGJDz4ZqprDh8rhTrcCa6Oz9KSSXKU00EUa5+7/RDsluYfobmbbHx0EwN23ArujcwygklyF9MhdRLLeDjbEWuBGd18fHQSgPC24JjrHAE8GPu7uj4sOIj+jgS7SuAZLchuAve5ey/vgV9CdbJeNSnKV0UAXkRZLcpuB66JDQPo71FWSq4gGuogAUE5Ue2t0jhFtq2UYLXtKkvF42Gvd/ZzoEKJSnIgcIfHtYEMcBLaYWRXvhSc+HlYluQpohS4iR7oEqKIFPoI1dPvpG6KDAJQPFq+LzjGASnIV0EAXkUdYdjtYKyW59XTN9yreBzezHcD7o3MMoJJcMA10EXkUM7ubtkpym4Cd0SGWyXo8rEpygTTQReSoGizJbS0n54VLfjysSnJBVIoTkRU1VpI7BDy/opJc1uNhVZILoIEuIisqe8u30j2WbsF9wOll2yFc4uNhvwKcWZ42yAj0yF1EVrSsJJfxHekhaivJZT0e9jQqObynFRroInJMZbX6MlSSi5L1eNhqDu9pgQa6iMyk7CurJBcg+fGwKsmNRHvoItJLgyW5C0rjP5y7bwT2Aeuis/SkktwINNBFpJcGS3IHgDPKBTbh3H0JuIl8T1hVkluwbL8QIhKswZLcOrqSXBWr4sTnA6gkt2Aa6CLS27KSXCurrY3ALnev4m+mmV0N7InOMYBKcgtUxS+niORTSnJvis4xoiXgqugQy2S9REcluQXRHrqIrEpjJTmAC8u74eHKLXG30707n4lKcguggS4iq9JgSe4h4Gwzq2J1nPgOdZXk5kyP3EVkVRosya2lK8lVsSpOfIe6SnJzpoEuIqvWYEluA7DX3atYFSe+Q10luTnSQBeRuUi8UhxqM3WtMLPeoa6S3JxoD11E5srdPwxcHJ1jRK8pK+RwZRvgdronCJncC/y6md0bHSQzDXQRmasGS3IH6U6Sq6Ukl/UO9c8DL1JJbjg9cheRuWqwJLeGukpy++neUc/mHOrawkhHA11E5k4luViJ71BXSW4VNNBFZCFUkguX9Q51leQG0h66iCyUu+8AtkXnGFFNJbl1dNetbozO0pNKcgNooIvIQpXH0LfQrWBbcBDYUp5QhEt8h7pKcj3pkbuILFT5g/wy2irJ7S3nrIcr97i/HDgUnaUnleR60kAXkYUzs/toqyS3nq75XsWrY4nvUFdJrgcNdBEZRYMluU3AzugQhyW+Q10luRlpD11ERtVgSe4tZZiGS3zoj0pyM9BAF5HRuftHyXc86VCHgMvKXna4srf/IfJdt/pFM3tbdIia/T+3/R6pV6XrUgAAAABJRU5ErkJggg==';

interface CompileContext {
  ast: ProgramNode;
  components: Map<string, ComponentNode>;
  state: RuntimeScope;
}

const KATTOUR_KEYWORDS = [
  'page', 'theme', 'state', 'computed', 'effect', 'route', 'component', 'view',
  'screen', 'column', 'row', 'card', 'text', 'title', 'button', 'input', 'link',
  'image', 'for', 'if', 'else', 'in', 'bind', 'click', 'go', 'nav', 'hero',
  'section', 'features', 'feature', 'codeblock', 'footer', 'badge', 'eyebrow',
  'subtitle', 'heading', 'split', 'body', 'divider', 'grid', 'actions', 'highlight'
];

const KATTOUR_CSS = `
:root {
  color-scheme: dark;
  --k-primary: #cb0606;
  --k-primary-light: #f43f5e;
  --k-bg: #07090f;
  --k-surface: rgba(13, 18, 30, 0.9);
  --k-surface-raised: rgba(17, 24, 39, 0.95);
  --k-border: rgba(255,255,255,0.07);
  --k-border-bright: rgba(255,255,255,0.13);
  --k-text: #e5e7eb;
  --k-text-muted: #9ca3af;
  --k-text-faint: #6b7280;
  --k-radius: 16px;
  --k-font: Inter, 'Helvetica Neue', system-ui, sans-serif;
  --k-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--k-bg);
  background-image:
    radial-gradient(ellipse 90% 60% at 50% -10%, rgba(203,6,6,0.13), transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(79,70,229,0.06), transparent 50%);
  background-attachment: fixed;
  color: var(--k-text);
  font-family: var(--k-font);
  min-height: 100vh;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Screen ─────────────────────────────── */
.k-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Nav ─────────────────────────────────── */
.k-nav {
  position: sticky;
  top: 0;
  z-index: 200;
  width: 100%;
  background: rgba(7,9,15,0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--k-border);
}
.k-nav-inner {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 40px;
  height: 62px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.k-nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.01em;
  margin-right: 16px;
  flex-shrink: 0;
}
.k-nav-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.k-nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}
.k-nav-links a {
  color: var(--k-text-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 7px 12px;
  border-radius: 9px;
  transition: color .15s, background .15s;
  white-space: nowrap;
}
.k-nav-links a:hover { color: var(--k-text); background: rgba(255,255,255,0.05); }
.k-nav-actions { margin-left: auto; display: flex; align-items: center; }
.k-nav-cta {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--k-primary), #ef4444);
  color: #fff !important;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(203,6,6,0.35);
  transition: opacity .15s, transform .1s;
  white-space: nowrap;
}
.k-nav-cta:hover { opacity: .85; color: #fff !important; }

/* ── Hero ────────────────────────────────── */
.k-hero {
  width: 100%;
  padding: 88px 40px 72px;
  text-align: center;
}
.k-hero-inner {
  max-width: 860px;
  margin: 0 auto;
}
.k-hero .k-eyebrow { margin-bottom: 22px; justify-content: center; }
.k-hero h1 {
  font-size: clamp(38px, 5.5vw, 76px);
  font-weight: 900;
  line-height: 1.02;
  letter-spacing: -0.04em;
  color: #fff;
  margin-bottom: 26px;
}
.k-hero h1 em { font-style: normal; color: var(--k-primary-light); }
.k-hero .k-subtitle {
  font-size: clamp(16px, 2vw, 20px);
  color: var(--k-text-muted);
  line-height: 1.7;
  max-width: 620px;
  margin: 0 auto 40px;
}
.k-hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 4px;
}

/* ── Section ─────────────────────────────── */
.k-section { width: 100%; padding: 72px 40px; }
.k-section-inner { max-width: 1160px; margin: 0 auto; }
.k-section-header { text-align: center; margin-bottom: 52px; }
.k-section-header .k-eyebrow { justify-content: center; margin-bottom: 14px; }
.k-section-title {
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 16px;
}
.k-section-subtitle {
  font-size: 18px;
  color: var(--k-text-muted);
  max-width: 560px;
  margin: 0 auto;
}

/* ── Features ────────────────────────────── */
.k-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.k-feature {
  background: var(--k-surface);
  border: 1px solid var(--k-border);
  border-radius: var(--k-radius);
  padding: 26px 24px;
  transition: border-color .2s, transform .2s;
}
.k-feature:hover { border-color: var(--k-border-bright); transform: translateY(-2px); }
.k-feature h3 {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
  margin-top: 10px;
}
.k-feature .k-body { font-size: 14px; color: var(--k-text-muted); line-height: 1.65; }
.k-feature a[data-k-link] { display: inline-block; margin-top: 14px; font-size: 13px; }

/* ── Grid ────────────────────────────────── */
.k-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* ── Split ───────────────────────────────── */
.k-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: start;
}

/* ── Column / Row ────────────────────────── */
.k-column { display: flex; flex-direction: column; gap: 16px; }
.k-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

/* ── Card ────────────────────────────────── */
.k-card {
  background: var(--k-surface);
  border: 1px solid var(--k-border);
  border-radius: var(--k-radius);
  padding: 24px;
}

/* ── Badge ───────────────────────────────── */
.k-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  background: rgba(203,6,6,0.14);
  color: #fca5a5;
  border: 1px solid rgba(203,6,6,0.28);
  margin-bottom: 2px;
}
.k-badge.done   { background: rgba(34,197,94,0.12); color: #86efac; border-color: rgba(34,197,94,0.25); }
.k-badge.active { background: rgba(251,191,36,0.12); color: #fde68a; border-color: rgba(251,191,36,0.25); }
.k-badge.next   { background: rgba(99,102,241,0.14); color: #c7d2fe; border-color: rgba(99,102,241,0.28); }
.k-badge.planned{ background: rgba(107,114,128,0.14); color: #d1d5db; border-color: rgba(107,114,128,0.25); }
.k-badge.free   { background: rgba(34,197,94,0.12); color: #86efac; border-color: rgba(34,197,94,0.25); }
.k-badge.open.source { background: rgba(203,6,6,0.14); }
.k-badge.community  { background: rgba(99,102,241,0.14); color: #c7d2fe; border-color: rgba(99,102,241,0.28); }
.k-badge.contribute { background: rgba(251,191,36,0.12); color: #fde68a; border-color: rgba(251,191,36,0.25); }

/* ── Eyebrow ─────────────────────────────── */
.k-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--k-primary-light);
}
.k-eyebrow::before {
  content: '';
  display: inline-block;
  width: 18px;
  height: 2px;
  background: var(--k-primary-light);
  border-radius: 2px;
}

/* ── Headings ────────────────────────────── */
.k-heading {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
  line-height: 1.3;
}
.k-title {
  font-size: clamp(26px, 4vw, 48px);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #fff;
  line-height: 1.1;
}
.k-subtitle { font-size: 16px; color: var(--k-text-muted); line-height: 1.7; }

/* ── Text / Body ─────────────────────────── */
.k-text { font-size: 15px; color: var(--k-text-muted); line-height: 1.7; }
.k-body { font-size: 14px; color: var(--k-text-muted); line-height: 1.7; }

/* ── Code Block ──────────────────────────── */
.k-codeblock {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 20px 22px;
  overflow-x: auto;
  font: 13px/1.75 var(--k-mono);
  color: #e6edf3;
  white-space: pre;
  tab-size: 2;
}
.k-codeblock code { display: block; }
.k-codeblock .kw  { color: #ff7b72; }
.k-codeblock .str { color: #a5d6ff; }
.k-codeblock .num { color: #79c0ff; }
.k-codeblock .var { color: #ffa657; }
.k-codeblock .cmt { color: #8b949e; font-style: italic; }
.k-codeblock .punc{ color: rgba(255,123,114,0.65); }

/* ── Buttons ─────────────────────────────── */
button, a.k-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 11px 22px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font: 600 15px var(--k-font);
  transition: opacity .15s, transform .1s, box-shadow .15s;
  text-decoration: none;
  background: linear-gradient(135deg, var(--k-primary), #ef4444);
  color: #fff;
  box-shadow: 0 4px 16px rgba(203,6,6,0.3);
  white-space: nowrap;
}
button:hover, a.k-btn:hover { opacity: .85; }
button:active, a.k-btn:active { transform: scale(0.98); }
button.k-secondary {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--k-border-bright);
  color: var(--k-text);
  box-shadow: none;
}
button.k-secondary:hover { background: rgba(255,255,255,0.08); }

/* ── Links ───────────────────────────────── */
a[data-k-link] {
  color: var(--k-primary-light);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: opacity .15s;
}
a[data-k-link]:hover { opacity: .8; text-decoration: underline; }

/* ── Input ───────────────────────────────── */
input {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--k-border-bright);
  border-radius: 10px;
  padding: 12px 15px;
  color: var(--k-text);
  font: 14px var(--k-font);
  width: 100%;
  transition: border-color .15s;
}
input::placeholder { color: var(--k-text-faint); }
input:focus { outline: none; border-color: rgba(203,6,6,0.55); box-shadow: 0 0 0 3px rgba(203,6,6,0.12); }

/* ── Divider ─────────────────────────────── */
.k-divider { border: none; border-top: 1px solid var(--k-border); margin: 40px 0; }

/* ── Actions ─────────────────────────────── */
.k-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

/* ── Footer ──────────────────────────────── */
.k-footer {
  width: 100%;
  border-top: 1px solid var(--k-border);
  padding: 36px 40px;
  margin-top: auto;
}
.k-footer-inner {
  max-width: 1160px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.k-footer p, .k-footer .k-text { font-size: 14px; color: var(--k-text-faint); }
.k-footer .k-row a { font-size: 13px; color: var(--k-text-faint); text-decoration: none; }
.k-footer .k-row a:hover { color: var(--k-text-muted); }

/* ── Highlight ───────────────────────────── */
.k-highlight {
  background: linear-gradient(135deg, rgba(203,6,6,0.1), rgba(244,63,94,0.06));
  border: 1px solid rgba(203,6,6,0.2);
  border-radius: var(--k-radius);
  padding: 32px;
}

/* ── Responsive ──────────────────────────── */
@media (max-width: 1024px) {
  .k-features { grid-template-columns: repeat(2, 1fr); }
  .k-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .k-nav-inner { padding: 0 20px; }
  .k-nav-links { display: none; }
  .k-hero { padding: 56px 24px 48px; }
  .k-section { padding: 48px 24px; }
  .k-features { grid-template-columns: 1fr; }
  .k-grid { grid-template-columns: 1fr; }
  .k-split { grid-template-columns: 1fr; }
  .k-footer { padding: 28px 24px; }
  .k-footer-inner { flex-direction: column; text-align: center; }
}
@media (max-width: 480px) {
  .k-hero-actions { flex-direction: column; align-items: center; }
  .k-hero-actions button, .k-hero-actions a { width: 100%; max-width: 320px; }
}
`;

export function compile(source: string): string {
  const ast = parse(source);
  const states = ast.body.filter(node => node.type === 'State');
  const computed = ast.body.filter(node => node.type === 'Computed');
  const effects = ast.body.filter(node => node.type === 'Effect');
  const routes = ast.body.filter(node => node.type === 'Route');
  const theme = ast.body.find(node => node.type === 'Theme');
  const view = ast.body.find(node => node.type === 'View');
  const pageNode = ast.body.find(node => node.type === 'Page');
  const components = new Map<string, ComponentNode>();
  const state = Object.fromEntries(states.map(s => [s.name, s.value]));
  const computedMap = Object.fromEntries(computed.map(c => [c.name, c.expression]));
  const effectList = effects.map(effect => ({ dependencies: effect.dependencies, body: effect.body }));

  for (const node of ast.body) {
    if (node.type === 'Component') components.set(node.name, node);
  }

  const previewState = { ...state };
  for (const [name, expression] of Object.entries(computedMap)) {
    previewState[name] = interpolateComputed(String(expression), previewState);
  }

  const ctx: CompileContext = { ast, components, state: previewState };

  const themeOverrides = theme && theme.type === 'Theme'
    ? theme.tokens.map((token: PropertyNode) => `--k-${token.key}: ${token.value};`).join('\n  ')
    : '';

  const pageTitle = pageNode?.type === 'Page' ? pageNode.name.replace(/([A-Z])/g, ' $1').trim() : 'Kattour';

  const html = view ? view.body.map(node => renderNode(node, ctx, {})).join('\n') : '';
  const routeMap = Object.fromEntries(
    routes.map(route => [route.path, route.body.map(node => renderNode(node, ctx, {})).join('\n')])
  );

  const initialHtml = Object.keys(routeMap).length > 0
    ? (routeMap['/'] ?? Object.values(routeMap)[0] ?? '')
    : html;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="Built with Kattour — the clarity-first UI language." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
<style>
${KATTOUR_CSS}
${themeOverrides ? `:root {\n  ${themeOverrides}\n}` : ''}
</style>
</head>
<body>
<div id="kattour-root">${initialHtml}</div>
<script>
window.__KATTOUR_STATE__ = ${JSON.stringify(state)};
window.__KATTOUR_COMPUTED__ = ${JSON.stringify(computedMap)};
window.__KATTOUR_EFFECTS__ = ${JSON.stringify(effectList)};
window.__KATTOUR_ROUTES__ = ${JSON.stringify(routeMap)};
${browserRuntime}
</script>
</body>
</html>`;
}

function renderNode(node: UINode, ctx: CompileContext, scope: RuntimeScope): string {
  if (node.type === 'If') return renderIf(node, ctx, scope);
  if (node.type === 'For') return renderFor(node, ctx, scope);
  return renderElement(node, ctx, scope);
}

function renderIf(node: IfNode, ctx: CompileContext, scope: RuntimeScope): string {
  const value = evaluateExpression(node.condition, ctx.state, scope);
  const branch = (Boolean(value) && value !== 'false') ? node.then : node.else;
  return branch.map(child => renderNode(child, ctx, scope)).join('');
}

function renderFor(node: ForNode, ctx: CompileContext, scope: RuntimeScope): string {
  const collection = evaluateExpression(node.collection, ctx.state, scope);
  const items = Array.isArray(collection)
    ? collection
    : String(collection ?? '').split(',').map(item => item.trim()).filter(Boolean);
  return items.map(item =>
    node.body.map(child => renderNode(child, ctx, { ...scope, [node.item]: item })).join('')
  ).join('');
}

function renderElement(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  // Check for user-defined components first
  const component = ctx.components.get(element.name);
  if (component) {
    const nextScope = { ...scope };
    component.params.forEach((param, index) => {
      if (index === 0 && element.label) {
        nextScope[param] = evaluateExpression(element.label, ctx.state, scope);
      }
    });
    return component.body.map(child => renderNode(child, ctx, nextScope)).join('');
  }

  switch (element.name) {
    case 'screen':    return renderScreen(element, ctx, scope);
    case 'nav':       return renderNav(element, ctx, scope);
    case 'hero':      return renderHero(element, ctx, scope);
    case 'section':   return renderSection(element, ctx, scope);
    case 'features':  return renderFeatures(element, ctx, scope);
    case 'feature':   return renderFeature(element, ctx, scope);
    case 'codeblock': return renderCodeblock(element, ctx, scope);
    case 'footer':    return renderFooter(element, ctx, scope);
    case 'badge':     return renderBadge(element, ctx, scope);
    case 'eyebrow':   return `<p class="k-eyebrow">${escapeHtml(element.label ?? '')}</p>`;
    case 'subtitle':  return `<p class="k-subtitle">${escapeHtml(element.label ?? '')}</p>`;
    case 'heading':   return `<h3 class="k-heading">${escapeHtml(element.label ?? '')}${element.children.map(c => renderNode(c, ctx, scope)).join('')}</h3>`;
    case 'body':      return `<p class="k-body">${escapeHtml(element.label ?? '')}${element.children.map(c => renderNode(c, ctx, scope)).join('')}</p>`;
    case 'divider':   return '<hr class="k-divider" />';
    case 'actions':   return `<div class="k-actions">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'highlight': return `<div class="k-highlight">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'split':     return `<div class="k-split">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'grid':      return `<div class="k-grid">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'column':    return `<div class="k-column">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'row':       return `<div class="k-row">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'card':      return `<div class="k-card">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
    case 'text':      return renderText(element, ctx, scope);
    case 'title':     return renderTitle(element, ctx, scope);
    case 'button':    return renderButton(element, ctx, scope);
    case 'input':     return renderInput(element, ctx, scope);
    case 'link':      return renderLink(element, ctx, scope);
    case 'image':     return renderImage(element, ctx, scope);
    default:          return renderGeneric(element, ctx, scope);
  }
}

function renderScreen(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  return `<div class="k-screen">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
}

function renderNav(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const children = element.children.filter(c => c.type === 'Element') as ElementNode[];
  const titleEl = children.find(c => c.name === 'title');
  const brandName = titleEl?.label ?? 'Kattour';
  const links = children.filter(c => c.name === 'link');
  const mainLinks = links.slice(0, -1);
  const ctaLink = links.at(-1);

  const linksHtml = mainLinks.map(link => {
    const to = link.properties.find(p => p.key === 'to')?.value ?? '#';
    const label = link.label ?? '';
    return `<a href="${escapeHtml(to)}" data-k-link="${escapeHtml(to)}">${escapeHtml(label)}</a>`;
  }).join('');

  const ctaHtml = ctaLink
    ? (() => {
        const to = ctaLink.properties.find(p => p.key === 'to')?.value ?? '#';
        const label = ctaLink.label ?? '';
        const isExternal = to.startsWith('http');
        const extra = isExternal ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${escapeHtml(to)}" data-k-link="${escapeHtml(to)}" class="k-nav-cta"${extra}>${escapeHtml(label)}</a>`;
      })()
    : '';

  return `<nav class="k-nav" role="navigation" aria-label="Main navigation">
  <div class="k-nav-inner">
    <a href="/" data-k-link="/" class="k-nav-brand">
      <img src="${KATTOUR_LOGO}" alt="Kattour" class="k-nav-logo" />
      ${escapeHtml(brandName)}
    </a>
    <div class="k-nav-links">${linksHtml}</div>
    <div class="k-nav-actions">${ctaHtml}</div>
  </div>
</nav>`;
}

function renderHero(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const children = element.children.filter(c => c.type === 'Element') as ElementNode[];
  const eyebrowEl  = children.find(c => c.name === 'eyebrow');
  const titleEl    = children.find(c => c.name === 'title');
  const subtitleEl = children.find(c => c.name === 'subtitle');
  const buttons    = children.filter(c => c.name === 'button');
  const codeEl     = children.find(c => c.name === 'codeblock');

  const eyebrowHtml  = eyebrowEl  ? `<p class="k-eyebrow">${escapeHtml(eyebrowEl.label ?? '')}</p>` : '';
  const titleHtml    = titleEl    ? `<h1>${escapeHtml(titleEl.label ?? '')}</h1>` : '';
  const subtitleHtml = subtitleEl ? `<p class="k-subtitle">${escapeHtml(subtitleEl.label ?? '')}</p>` : '';

  const actionsHtml = buttons.length > 0
    ? `<div class="k-hero-actions">${buttons.map((b, i) => {
        const modified = i > 0
          ? { ...b, properties: [...b.properties, { key: 'variant', value: 'secondary' }] }
          : b;
        return renderButton(modified, ctx, scope);
      }).join('')}</div>`
    : '';

  const codeHtml = codeEl ? `<div style="margin-top:40px;text-align:left;">${renderCodeblock(codeEl, ctx, scope)}</div>` : '';

  return `<section class="k-hero">
  <div class="k-hero-inner">
    ${eyebrowHtml}
    ${titleHtml}
    ${subtitleHtml}
    ${actionsHtml}
    ${codeHtml}
  </div>
</section>`;
}

function renderSection(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const children   = element.children.filter(c => c.type === 'Element') as ElementNode[];
  const eyebrowEl  = children.find(c => c.name === 'eyebrow');
  const titleEl    = children.find(c => c.name === 'title');
  const subtitleEl = children.find(c => c.name === 'subtitle');
  const rest       = children.filter(c => !['eyebrow', 'title', 'subtitle'].includes(c.name));

  const hasHeader  = eyebrowEl || titleEl || subtitleEl;

  const headerHtml = hasHeader ? `<div class="k-section-header">
    ${eyebrowEl  ? `<p class="k-eyebrow">${escapeHtml(eyebrowEl.label ?? '')}</p>` : ''}
    ${titleEl    ? `<h2 class="k-section-title">${escapeHtml(titleEl.label ?? '')}</h2>` : ''}
    ${subtitleEl ? `<p class="k-section-subtitle">${escapeHtml(subtitleEl.label ?? '')}</p>` : ''}
  </div>` : '';

  const contentHtml = rest.map(c => renderNode(c, ctx, scope)).join('');

  return `<section class="k-section">
  <div class="k-section-inner">
    ${headerHtml}
    ${contentHtml}
  </div>
</section>`;
}

function renderFeatures(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  return `<div class="k-features">${element.children.map(c => renderNode(c, ctx, scope)).join('')}</div>`;
}

function renderFeature(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const name     = element.label ?? element.name;
  const children = element.children.filter(c => c.type === 'Element') as ElementNode[];
  const badgeEl  = children.find(c => c.name === 'badge');
  const bodyEl   = children.find(c => c.name === 'body');
  const linkEl   = children.find(c => c.name === 'link');
  const rest     = children.filter(c => !['badge', 'body', 'link'].includes(c.name));

  const badgeHtml = badgeEl ? renderBadge(badgeEl, ctx, scope) : '';
  const bodyHtml  = bodyEl  ? `<p class="k-body">${escapeHtml(bodyEl.label ?? '')}</p>` : '';
  const linkHtml  = linkEl  ? renderLink(linkEl, ctx, scope) : '';
  const restHtml  = rest.map(c => renderNode(c, ctx, scope)).join('');

  return `<article class="k-feature">
  ${badgeHtml}
  <h3>${escapeHtml(name)}</h3>
  ${bodyHtml}
  ${restHtml}
  ${linkHtml}
</article>`;
}

function renderCodeblock(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  let code = element.label ?? element.children
    .filter(c => c.type === 'Element' && (c as ElementNode).name === 'text')
    .map(c => (c as ElementNode).label ?? '').join('\n');

  code = code
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');

  return `<pre class="k-codeblock"><code>${highlightKattour(code)}</code></pre>`;
}

function highlightKattour(code: string): string {
  const keywords = new Set(KATTOUR_KEYWORDS);
  let result = '';
  let i = 0;

  while (i < code.length) {
    // Comments
    if (code[i] === '/' && code[i + 1] === '/') {
      let comment = '';
      while (i < code.length && code[i] !== '\n') comment += code[i++];
      result += `<span class="cmt">${escapeHtml(comment)}</span>`;
      continue;
    }

    // Strings
    if (code[i] === '"') {
      let str = '"';
      i++;
      while (i < code.length && !(code[i] === '"' && code[i - 1] !== '\\')) {
        str += code[i++];
      }
      str += '"';
      i++;
      result += `<span class="str">${escapeHtml(str)}</span>`;
      continue;
    }

    // Numbers
    if (/\d/.test(code[i])) {
      let num = '';
      while (i < code.length && /[\d.]/.test(code[i])) num += code[i++];
      result += `<span class="num">${escapeHtml(num)}</span>`;
      continue;
    }

    // Variables ($...)
    if (code[i] === '$') {
      let varName = '$';
      i++;
      while (i < code.length && /[a-zA-Z0-9_.]/.test(code[i])) varName += code[i++];
      result += `<span class="var">${escapeHtml(varName)}</span>`;
      continue;
    }

    // Identifiers / keywords
    if (/[a-zA-Z_]/.test(code[i])) {
      let word = '';
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) word += code[i++];
      result += keywords.has(word)
        ? `<span class="kw">${escapeHtml(word)}</span>`
        : escapeHtml(word);
      continue;
    }

    // Braces
    if (code[i] === '{' || code[i] === '}') {
      result += `<span class="punc">${escapeHtml(code[i])}</span>`;
      i++;
      continue;
    }

    result += escapeHtml(code[i]);
    i++;
  }

  return result;
}

function renderFooter(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const contentHtml = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<footer class="k-footer"><div class="k-footer-inner">${contentHtml}</div></footer>`;
}

function renderBadge(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const label = element.label ?? '';
  const cssClass = label.toLowerCase().replace(/\s+/g, '-');
  return `<span class="k-badge ${cssClass}">${escapeHtml(label)}</span>`;
}

function renderText(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const label = element.label ? interpolateTemplate(element.label, ctx.state, scope) : '';
  const dataAttr = element.label ? ` data-k-text="${escapeHtml(element.label)}"` : '';
  const children = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<p class="k-text"${dataAttr}>${escapeHtml(label)}${children}</p>`;
}

function renderTitle(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const label = element.label ? interpolateTemplate(element.label, ctx.state, scope) : '';
  const dataAttr = element.label ? ` data-k-text="${escapeHtml(element.label)}"` : '';
  const children = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<h1 class="k-title"${dataAttr}>${escapeHtml(label)}${children}</h1>`;
}

function renderButton(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const attrs: string[] = [];
  for (const event of element.events) {
    if (event.name === 'click') attrs.push(`data-k-click="${escapeHtml(event.action)}"`);
  }
  const isSecondary = element.properties.some(p => p.key === 'variant' && p.value === 'secondary');
  if (isSecondary) attrs.push('class="k-secondary"');

  const label = element.label
    ? `<span data-k-text="${escapeHtml(element.label)}">${escapeHtml(interpolateTemplate(element.label, ctx.state, scope))}</span>`
    : '';
  const children = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<button ${attrs.join(' ')}>${label}${children}</button>`;
}

function renderLink(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const to = element.properties.find(p => p.key === 'to')?.value ?? '#';
  const isExternal = to.startsWith('http');
  const attrs = [`href="${escapeHtml(to)}"`, `data-k-link="${escapeHtml(to)}"`];
  if (isExternal) attrs.push('target="_blank" rel="noopener noreferrer"');

  const label = element.label
    ? `<span data-k-text="${escapeHtml(element.label)}">${escapeHtml(interpolateTemplate(element.label, ctx.state, scope))}</span>`
    : '';
  const children = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<a ${attrs.join(' ')}>${label}${children}</a>`;
}

function renderInput(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const attrs: string[] = [];
  const placeholder = element.label ?? element.properties.find(p => p.key === 'placeholder')?.value ?? '';
  if (placeholder) attrs.push(`placeholder="${escapeHtml(placeholder)}"`);
  for (const binding of element.bindings) {
    attrs.push(`data-k-bind="${escapeHtml(binding.state)}"`);
    const val = String(evaluateExpression(binding.state, ctx.state, scope) ?? '');
    if (val) attrs.push(`value="${escapeHtml(val)}"`);
  }
  for (const prop of element.properties) {
    if (prop.key !== 'placeholder') attrs.push(`${prop.key}="${escapeHtml(prop.value)}"`);
  }
  return `<input ${attrs.join(' ')} />`;
}

function renderImage(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const src = element.label ?? element.properties.find(p => p.key === 'src')?.value ?? '';
  const alt = element.properties.find(p => p.key === 'alt')?.value ?? '';
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
}

function renderGeneric(element: ElementNode, ctx: CompileContext, scope: RuntimeScope): string {
  const tag = 'div';
  const attrs: string[] = [`data-kattour="${escapeHtml(element.name)}"`];
  for (const event of element.events) {
    if (event.name === 'click') attrs.push(`data-k-click="${escapeHtml(event.action)}"`);
  }
  for (const binding of element.bindings) {
    attrs.push(`data-k-bind="${escapeHtml(binding.state)}"`);
  }
  const label = element.label ? `<span data-k-text="${escapeHtml(element.label)}">${escapeHtml(interpolateTemplate(element.label, ctx.state, scope))}</span>` : '';
  const children = element.children.map(c => renderNode(c, ctx, scope)).join('');
  return `<${tag} ${attrs.join(' ')}>${label}${children}</${tag}>`;
}

function interpolateComputed(expression: string, state: RuntimeScope): string {
  return expression.split('+').map(part => part.trim()).filter(Boolean).map(part => {
    if (part.startsWith('"') && part.endsWith('"')) return part.slice(1, -1);
    return String(evaluateExpression(part, state, {}) ?? '');
  }).join('');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
