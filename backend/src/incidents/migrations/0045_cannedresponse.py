# Generated by Django 2.2.12 on 2020-04-26 20:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('incidents', '0044_auto_20200425_2011'),
    ]

    operations = [
        migrations.CreateModel(
            name='CannedResponse',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=30)),
                ('message', models.CharField(max_length=200)),
            ],
        ),
    ]
